/**
 * @file Hooks/usePbjData.ts
 *
 * Custom hook untuk mengambil dan mengelola state data PBJ
 * dari API Dashboard Kota Padang.
 *
 * Menerapkan best practice:
 * - AbortController untuk mencegah race condition dan memory leak
 * - State machine sederhana (idle → loading → success/error)
 * - Fungsi retry yang dapat dipanggil ulang oleh komponen
 * - Cleanup effect saat komponen di-unmount
 */

import { fetchPbjData } from "@/Services/pbj-service";
import type { PbjSummary } from "@/Types/pbj";
import { useCallback, useEffect, useRef, useState } from "react";

/** Status fetch yang mungkin terjadi. */
type FetchStatus = "idle" | "loading" | "success" | "error";

/** Nilai kembalian hook `usePbjData`. */
export interface UsePbjDataReturn {
    /** Data PBJ yang sudah dinormalisasi, atau null jika belum/gagal dimuat. */
    data: PbjSummary | null;
    /** True selama request sedang berjalan. */
    isLoading: boolean;
    /** Pesan error jika fetch gagal, atau null jika tidak ada error. */
    error: string | null;
    /** Status state machine saat ini. */
    status: FetchStatus;
    /** Tahun anggaran yang sedang ditampilkan. */
    tahun: number;
    /** Mengubah tahun dan otomatis me-refetch data. */
    setTahun: (tahun: number) => void;
    /** Mencoba ulang fetch terakhir yang gagal tanpa mengubah parameter. */
    retry: () => void;
}

/**
 * Mengelola seluruh lifecycle pengambilan data PBJ.
 *
 * Alur eksekusi:
 * 1. Saat `tahun` berubah atau `retry()` dipanggil, status reset ke "loading".
 * 2. Request baru dibuat with AbortController baru.
 * 3. Request lama dibatalkan untuk mencegah race condition.
 * 4. Saat berhasil → status "success", data diperbarui.
 * 5. Saat gagal (bukan abort) → status "error", pesan error disimpan.
 * 6. Saat komponen di-unmount → request otomatis dibatalkan via cleanup.
 *
 * @param initialTahun - Tahun awal yang akan di-fetch (default: tahun berjalan)
 * @returns State data, status, error, dan fungsi kontrol
 *
 * @example
 * const { data, isLoading, error, tahun, setTahun, retry } = usePbjData(2026);
 */
export function usePbjData(initialTahun?: number): UsePbjDataReturn {
    const defaultTahun = initialTahun ?? new Date().getFullYear();

    const [tahun, setTahunState] = useState(defaultTahun);
    const [data, setData]        = useState<PbjSummary | null>(null);
    const [status, setStatus]    = useState<FetchStatus>("idle");
    const [error, setError]      = useState<string | null>(null);

    /** Referensi AbortController saat ini untuk pembatalan request. */
    const abortRef = useRef<AbortController | null>(null);

    /**
     * Inti pengambilan data. Dibungkus useCallback agar `retry` dan
     * perubahan `tahun` tidak membuat effect loop.
     *
     * @param year - Tahun yang akan di-fetch
     */
    const doFetch = useCallback(async (year: number, skipCache: boolean = false) => {
        // Batalkan request sebelumnya jika masih berjalan
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setStatus("loading");
        setError(null);

        try {
            const result = await fetchPbjData(year, abortRef.current.signal, { skipCache });
            setData(result);
            setStatus("success");
        } catch (err) {
            // Request dibatalkan secara sengaja — bukan error nyata
            if ((err as Error).name === "AbortError") return;

            setError((err as Error).message ?? "Gagal memuat data PBJ");
            setStatus("error");
        }
    }, []);

    /**
     * Mengubah tahun target dan otomatis me-refetch data.
     * State data lama dipertahankan selama loading agar UI tidak flash kosong.
     *
     * @param newTahun - Tahun baru yang dipilih pengguna
     */
    const setTahun = useCallback((newTahun: number) => {
        setTahunState(newTahun);
    }, []);

    /**
     * Mencoba ulang fetch dengan tahun yang sama.
     * Berguna setelah error jaringan sementara.
     */
    const retry = useCallback(() => {
        doFetch(tahun, true);
    }, [tahun, doFetch]);

    /** Fetch otomatis saat `tahun` berubah. */
    useEffect(() => {
        doFetch(tahun);

        // Cleanup: batalkan request yang masih berjalan saat komponen unmount
        return () => {
            abortRef.current?.abort();
        };
    }, [tahun, doFetch]);

    return {
        data,
        isLoading: status === "loading",
        error,
        status,
        tahun,
        setTahun,
        retry,
    };
}

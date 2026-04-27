/**
 * @file Hooks/useApbdData.ts
 *
 * Custom hook untuk mengambil dan mengelola state data APBD
 * dari API Dashboard Kota Padang.
 *
 * Pola identik dengan `usePbjData` untuk konsistensi codebase:
 * - AbortController mencegah race condition & memory leak
 * - State machine: idle → loading → success/error
 * - Fungsi retry yang dipanggil ulang tanpa mengubah parameter
 * - Cleanup efek saat komponen di-unmount
 */

import { fetchApbdData } from "@/Services/apbd-service";
import type { ApbdSummary } from "@/Types/apbd";
import { useCallback, useEffect, useRef, useState } from "react";

/** Status fetch yang mungkin terjadi. */
type FetchStatus = "idle" | "loading" | "success" | "error";

/** Nilai kembalian hook `useApbdData`. */
export interface UseApbdDataReturn {
    /** Data APBD yang sudah dinormalisasi, atau null jika belum/gagal dimuat. */
    data: ApbdSummary | null;
    /** True selama request sedang berjalan. */
    isLoading: boolean;
    /** Pesan error jika fetch gagal, atau null jika tidak ada error. */
    error: string | null;
    /** Status state machine saat ini. */
    status: FetchStatus;
    /** Mencoba ulang fetch terakhir yang gagal. */
    retry: () => void;
}

/**
 * Mengelola seluruh lifecycle pengambilan data APBD.
 *
 * @param tahun - Tahun anggaran yang ingin diambil
 * @param initialData - Data awal dari server (SSR)
 */
export function useApbdData(tahun: number, initialData?: ApbdSummary | null): UseApbdDataReturn {
    const [data, setData]     = useState<ApbdSummary | null>(initialData ?? null);
    const [status, setStatus] = useState<FetchStatus>(initialData ? "success" : "idle");
    const [error, setError]   = useState<string | null>(null);

    /** Flag untuk menandai apakah ini render pertama (untuk skip fetch jika ada initialData) */
    const isFirstRender = useRef(true);

    /** Referensi AbortController aktif untuk pembatalan request. */
    const abortRef = useRef<AbortController | null>(null);

    /**
     * Inti fungsi pengambilan data.
     * Dibungkus `useCallback` agar referensinya stabil di antara render,
     * mencegah re-subscribe effect yang tidak perlu.
     *
     * @param year - Tahun yang akan di-fetch
     */
    const doFetch = useCallback(async (year: number, skipCache: boolean = false) => {
        // Batalkan request sebelumnya yang mungkin masih berjalan
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setStatus("loading");
        setError(null);

        try {
            const result = await fetchApbdData(year, abortRef.current.signal, { skipCache });
            setData(result);
            setStatus("success");
        } catch (err) {
            // AbortError bukan error nyata — hanya pembatalan yang disengaja
            if ((err as Error).name === "AbortError") return;

            setError((err as Error).message ?? "Gagal memuat data APBD");
            setStatus("error");
        }
    }, []);

    /**
     * Mencoba ulang fetch dengan tahun yang sama.
     * Berguna setelah koneksi internet terganggu sementara.
     */
    const retry = useCallback(() => {
        doFetch(tahun, true);
    }, [tahun, doFetch]);

    /**
     * Jalankan fetch secara otomatis setiap kali `tahun` berubah.
     * Cleanup function membatalkan request yang masih berjalan saat unmount.
     */
    useEffect(() => {
        // Skip fetch pada render pertama jika data sudah ada dari SSR
        if (isFirstRender.current && data) {
            isFirstRender.current = false;
            return;
        }

        doFetch(tahun);
        isFirstRender.current = false;

        return () => {
            abortRef.current?.abort();
        };
    }, [tahun, doFetch, data]);

    return {
        data,
        isLoading: status === "loading",
        error,
        status,
        retry,
    };
}

/**
 * @file Hooks/usePendapatanSkpd.ts
 *
 * Custom hook untuk mengambil dan mengelola state data Pendapatan Per-SKPD
 * dari API Dashboard Kota Padang.
 *
 * Pola identik dengan `usePbjData` dan `useApbdData` untuk konsistensi:
 * - AbortController mencegah race condition & memory leak
 * - State machine: idle → loading → success/error
 * - Retry tanpa mengubah parameter
 * - Cleanup otomatis saat unmount
 */

import { fetchPendapatanSkpd } from "@/Services/pendapatanSkpdService";
import type { PendapatanSkpdNormalized } from "@/Types/PendapatanSkpd";
import { useCallback, useEffect, useRef, useState } from "react";

/** Status fetch yang mungkin terjadi. */
type FetchStatus = "idle" | "loading" | "success" | "error";

/** Nilai kembalian hook `usePendapatanSkpd`. */
export interface UsePendapatanSkpdReturn {
    /** Array SKPD yang sudah dinormalisasi dan diurutkan, atau null jika belum/gagal dimuat. */
    data: PendapatanSkpdNormalized[] | null;
    /** True selama request sedang berjalan. */
    isLoading: boolean;
    /** Pesan error jika fetch gagal, atau null jika tidak ada error. */
    error: string | null;
    /** Status state machine. */
    status: FetchStatus;
    /** Mencoba ulang fetch terakhir yang gagal. */
    retry: () => void;
}

/**
 * Mengelola lifecycle pengambilan data Pendapatan Per-SKPD.
 *
 * Fetch dijalankan otomatis saat `tahun` berubah.
 * Request sebelumnya dibatalkan via AbortController.
 *
 * @param tahun - Tahun anggaran (dikontrol oleh parent/halaman)
 * @returns State data, status, error, dan fungsi retry
 *
 * @example
 * const { data, isLoading, error, retry } = usePendapatanSkpd(2026);
 */
export function usePendapatanSkpd(tahun: number): UsePendapatanSkpdReturn {
    const [data, setData]     = useState<PendapatanSkpdNormalized[] | null>(null);
    const [status, setStatus] = useState<FetchStatus>("idle");
    const [error, setError]   = useState<string | null>(null);

    /** Referensi AbortController aktif untuk pembatalan request. */
    const abortRef = useRef<AbortController | null>(null);

    /**
     * Fungsi inti pengambilan data.
     *
     * Membatalkan request sebelumnya, membuat controller baru,
     * lalu memanggil service layer dan memperbarui state sesuai hasil.
     *
     * @param year - Tahun yang akan di-fetch
     */
    const doFetch = useCallback(async (year: number, skipCache: boolean = false) => {
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setStatus("loading");
        setError(null);

        try {
            const result = await fetchPendapatanSkpd(year, abortRef.current.signal, { skipCache });
            setData(result);
            setStatus("success");
        } catch (err) {
            if ((err as Error).name === "AbortError") return;
            setError((err as Error).message ?? "Gagal memuat data pendapatan SKPD");
            setStatus("error");
        }
    }, []);

    /**
     * Mencoba ulang fetch dengan tahun yang sama.
     * Berguna setelah gagal karena jaringan sementara.
     */
    const retry = useCallback(() => {
        doFetch(tahun, true);
    }, [tahun, doFetch]);

    /**
     * Fetch otomatis saat `tahun` berubah.
     * Cleanup membatalkan request yang sedang berjalan saat unmount.
     */
    useEffect(() => {
        doFetch(tahun);
        return () => {
            abortRef.current?.abort();
        };
    }, [tahun, doFetch]);

    return {
        data,
        isLoading: status === "loading",
        error,
        status,
        retry,
    };
}

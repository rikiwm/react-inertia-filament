/**
 * @file Hooks/useOpdDetail.ts
 *
 * Custom hook untuk fetch dan manage data detail OPD.
 * Menangani loading state, error handling, dan caching.
 */

import { useEffect, useState, useCallback } from "react";
import {
    fetchOpdDetail,
    type OpdDetailResponse,
    type OpdDetailType,
} from "@/Services/opdDetailService";

export interface UseOpdDetailResult {
    data: OpdDetailResponse | null;
    loading: boolean;
    error: Error | null;
    refetch: (skipCache?: boolean) => void;
}

/**
 * Hook untuk fetch OPD detail data berdasarkan type dan nama_opd.
 *
 * @param type - Type data: "belanja" atau "pendapatan"
 * @param namaOpd - Nama OPD untuk dicari
 * @param tahun - Tahun anggaran (optional, default: current year)
 * @returns UseOpdDetailResult
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useOpdDetail("belanja", "Dinas Pendidikan", 2024);
 * ```
 */
export function useOpdDetail(
    type: OpdDetailType,
    namaOpd: string,
    tahun: number | string = new Date().getFullYear(),
): UseOpdDetailResult {
    const [data, setData] = useState<OpdDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(
        async (signal?: AbortSignal) => {
            try {
                setLoading(true);
                setError(null);

                const result = await fetchOpdDetail(type, namaOpd, tahun, signal);
                setData(result);
            } catch (err) {
                if (err instanceof Error && err.name !== "AbortError") {
                    setError(err);
                    console.error("Failed to fetch OPD detail data:", err);
                }
            } finally {
                setLoading(false);
            }
        },
        [type, namaOpd, tahun],
    );

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => controller.abort();
    }, [fetchData]);

    const refetch = useCallback(
        (skipCache: boolean = true) => {
            fetchData();
        },
        [fetchData],
    );

    return { data, loading, error, refetch };
}

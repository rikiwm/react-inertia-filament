/**
 * @file Hooks/usePendapatanDaerahData.ts
 *
 * Custom hook untuk fetch dan manage data Pendapatan Daerah per SKPD.
 * Menangani loading state, error handling, dan caching.
 */

import { useEffect, useState, useCallback } from "react";
import {
    fetchPendapatanDaerahBySkpd,
    type PendapatanDaerahResponse,
} from "@/Services/pendapatan-daerah-service";

export interface UsePendapatanDaerahDataResult {
    data: PendapatanDaerahResponse | null;
    loading: boolean;
    error: Error | null;
    setTahun: (tahun: number) => void;
    refetch: (skipCache?: boolean) => void;
}

export function usePendapatanDaerahData(tahun: number | string): UsePendapatanDaerahDataResult {
    const [data, setData] = useState<PendapatanDaerahResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(
        async (signal?: AbortSignal, skipCache: boolean = false) => {
            try {
                setLoading(true);
                setError(null);

                const result = await fetchPendapatanDaerahBySkpd(tahun, signal, {
                    skipCache,
                });
                setData(result);
            } catch (err) {
                if (err instanceof Error && err.name !== "AbortError") {
                    setError(err);
                    console.error("Failed to fetch pendapatan daerah data:", err);
                }
            } finally {
                setLoading(false);
            }
        },
        [tahun],
    );

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal, false);
        return () => controller.abort();
    }, [fetchData]);

    const setTahun = useCallback((_newTahun: number) => {
        // This is now handled by the parent component passing a new 'tahun' prop
        console.warn(
            "setTahun in usePendapatanDaerahData is deprecated. Use the parent component's state.",
        );
    }, []);

    const refetch = useCallback(
        (skipCache: boolean = true) => {
            fetchData(undefined, skipCache);
        },
        [fetchData],
    );

    return { data, loading, error, refetch, setTahun };
}


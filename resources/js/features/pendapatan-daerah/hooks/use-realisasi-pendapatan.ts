import { useEffect, useState, useCallback } from "react";
import {
    fetchRealisasiPendapatan,
    type RealisasiPendapatanResponse,
} from "@/Services/pendapatan-daerah-service";

export interface UseRealisasiPendapatanResult {
    data: RealisasiPendapatanResponse | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useRealisasiPendapatan(tahun: number | string): UseRealisasiPendapatanResult {
    const [data, setData] = useState<RealisasiPendapatanResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(
        async (signal?: AbortSignal) => {
            try {
                setLoading(true);
                setError(null);

                const result = await fetchRealisasiPendapatan(tahun, signal);
                setData(result);
            } catch (err) {
                if (err instanceof Error && err.name !== "AbortError") {
                    setError(err);
                    console.error("Failed to fetch realisasi pendapatan data:", err);
                }
            } finally {
                setLoading(false);
            }
        },
        [tahun],
    );

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => controller.abort();
    }, [fetchData]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch };
}

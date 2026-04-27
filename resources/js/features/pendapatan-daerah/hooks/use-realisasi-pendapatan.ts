import { useEffect, useState, useCallback, useRef } from "react";
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

export function useRealisasiPendapatan(tahun: number | string, initialData?: RealisasiPendapatanResponse): UseRealisasiPendapatanResult {
    const [data, setData] = useState<RealisasiPendapatanResponse | null>(initialData || null);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<Error | null>(null);
    const firstRenderRef = useRef(true);

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
        if (firstRenderRef.current && initialData) {
            firstRenderRef.current = false;
            return;
        }
        const controller = new AbortController();
        fetchData(controller.signal);
        firstRenderRef.current = false;
        return () => controller.abort();
    }, [fetchData, initialData]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch };
}

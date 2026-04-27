import { fetchApbdData } from "@/Services/apbd-service";
import type { ApbdSummary } from "@/Types/apbd";
import { useCallback, useEffect, useState, useRef } from "react";

export interface ComparisonDataPoint {
    tahun: number;
    pendapatan_target: number;
    pendapatan_realisasi: number;
    pendapatan_persen: number;
    belanja_anggaran: number;
    belanja_realisasi: number;
    belanja_persen: number;
}

export function useComparisonData(years: number[], initialData?: ComparisonDataPoint[]) {
    const [data, setData] = useState<ComparisonDataPoint[]>(initialData || []);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<string | null>(null);
    const firstRenderRef = useRef(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const results = await Promise.all(
                years.map(async (year) => {
                    try {
                        const summary = await fetchApbdData(year, new AbortController().signal);
                        return {
                            tahun: year,
                            pendapatan_target: summary.pendapatanDaerah.anggaran,
                            pendapatan_realisasi: summary.pendapatanDaerah.realisasi,
                            pendapatan_persen: summary.pendapatanDaerah.persenRealisasi,
                            belanja_anggaran: summary.belanjaDaerah.anggaran,
                            belanja_realisasi: summary.belanjaDaerah.realisasi,
                            belanja_persen: summary.belanjaDaerah.persenRealisasi,
                        };
                    } catch (e) {
                        console.error(`Gagal mengambil data APBD tahun ${year}:`, e);
                        return null;
                    }
                })
            );

            const filteredResults = results.filter((r): r is ComparisonDataPoint => r !== null);
            setData(filteredResults.sort((a, b) => a.tahun - b.tahun));
        } catch (err) {
            setError("Gagal memuat data komparasi");
        } finally {
            setLoading(false);
        }
    }, [years]);

    useEffect(() => {
        if (firstRenderRef.current && initialData && initialData.length > 0) {
            firstRenderRef.current = false;
            return;
        }
        fetchData();
        firstRenderRef.current = false;
    }, [fetchData, initialData]);

    return { data, loading, error, refetch: fetchData };
}

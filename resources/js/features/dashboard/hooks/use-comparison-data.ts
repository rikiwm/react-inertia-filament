/**
 * @file Hooks/useComparisonData.ts
 *
 * Hook untuk mengambil data APBD multi-tahun guna keperluan analitik dan komparasi.
 */

import { fetchApbdData } from "@/Services/apbd-service";
import type { ApbdSummary } from "@/Types/apbd";
import { useCallback, useEffect, useState } from "react";

export interface ComparisonDataPoint {
    tahun: number;
    pendapatan_target: number;
    pendapatan_realisasi: number;
    pendapatan_persen: number;
    belanja_anggaran: number;
    belanja_realisasi: number;
    belanja_persen: number;
}

export function useComparisonData(years: number[]) {
    const [data, setData] = useState<ComparisonDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

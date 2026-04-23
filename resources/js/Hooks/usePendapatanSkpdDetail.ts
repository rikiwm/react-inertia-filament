/**
 * @file Hooks/usePendapatanSkpdDetail.ts
 *
 * Custom hook untuk fetch dan manage data Pendapatan SKPD detail.
 * Mengambil data dari API list-pendapatan-skpd dan memfilter berdasarkan nama OPD.
 */

import { useEffect, useState, useCallback } from "react";
import { fetchPendapatanSkpd } from "@/Services/pendapatanSkpdService";
import type { PendapatanSkpdNormalized } from "@/Types/PendapatanSkpd";

export interface UsePendapatanSkpdDetailResult {
    data: PendapatanSkpdNormalized | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

/**
 * Hook untuk fetch pendapatan SKPD dan filter berdasarkan nama OPD.
 *
 * @param namaOpd - Nama OPD untuk dicari
 * @param tahun - Tahun anggaran
 * @returns UsePendapatanSkpdDetailResult
 *
 * @example
 * ```tsx
 * const { data, loading, error } = usePendapatanSkpdDetail("BADAN PENDAPATAN DAERAH", 2026);
 * ```
 */
export function usePendapatanSkpdDetail(
    namaOpd: string,
    tahun: number | string,
): UsePendapatanSkpdDetailResult {
    const [data, setData] = useState<PendapatanSkpdNormalized | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const signal = new AbortController().signal;

            // Fetch full pendapatan SKPD data
            const allData = await fetchPendapatanSkpd(tahun, signal);


            // Find matching OPD by nama_opd (case-insensitive)
            const matchedData = allData.find(
                (item: PendapatanSkpdNormalized) =>
                    item.skpd.toUpperCase() === namaOpd.toUpperCase(),
            );

            if (!matchedData) {

                throw new Error(
                    `OPD dengan nama "${namaOpd}" tidak ditemukan di data Pendapatan SKPD`,
                );
            }

            setData(matchedData);
        } catch (err) {
            if (err instanceof Error && err.name !== "AbortError") {
                setError(err);
                console.error("Failed to fetch pendapatan SKPD detail:", err);
            }
        } finally {
            setLoading(false);
        }
    }, [namaOpd, tahun]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch };
}

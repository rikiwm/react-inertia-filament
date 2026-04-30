/**
 * @file Hooks/useRealisasiProgram.ts
 *
 * Custom hook untuk fetch data realisasi program dari OPD terkait
 */

import { useEffect, useState, useCallback } from "react";

export interface ProgramKegiatanDetail {
    total_anggaran: number;
    total_realisasi: number;
    persen: number;
    pptk: string;
}

export interface RealisasiProgramResponse {
    message: string;
    response_time: string;
    result: {
        data: Record<string, Record<string, ProgramKegiatanDetail>> | never[];
        summary: {
            anggaran: number;
            realisasi: number;
            persen: number;
        };
        formatted_title: string;
    };
}

export interface UseRealisasiProgramResult {
    data: RealisasiProgramResponse["result"]["data"] | null;
    summary: RealisasiProgramResponse["result"]["summary"] | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useRealisasiProgram(slug: string, tahun: number | string): UseRealisasiProgramResult {
    const [data, setData] = useState<RealisasiProgramResponse["result"]["data"] | null>(null);
    const [summary, setSummary] = useState<RealisasiProgramResponse["result"]["summary"] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!slug || !tahun) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`https://dashboard.padang.go.id/api/v1/realisasi-program/${slug}/${tahun}`);
            if (!response.ok) {
                throw new Error(`Gagal memuat data realisasi program (${response.status})`);
            }

            const json: RealisasiProgramResponse = await response.json();

            // API might return [] if empty, we handle it
            setData(json.result.data);
            setSummary(json.result.summary);

        } catch (err) {
            if (err instanceof Error && err.name !== "AbortError") {
                setError(err);
                console.error("Failed to fetch realisasi program:", err);
            }
        } finally {
            setLoading(false);
        }
    }, [slug, tahun]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return { data, summary, loading, error, refetch };
}

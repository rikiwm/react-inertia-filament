/**
 * @file Hooks/useProgulData.ts
 *
 * Custom hook untuk mengelola data Progul.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    fetchAllProgulData,
    getProgulCategories,
    getActivasiByProgul,
    type ProgulData,
    type ProgulCategory,
    type ActivasiCategory,
    type KinerjaItem,
    type ActivasiItem
} from "@/Services/progul-service";

export function useProgulData(initialData?: ProgulData[]) {
    const [data, setData] = useState<ProgulData[]>(initialData || []);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<Error | null>(null);
    const firstRenderRef = useRef(true);

    const fetchData = useCallback(async (signal?: AbortSignal) => {
        try {
            setLoading(true);
            const result = await fetchAllProgulData(signal);
            setData(result);
            setError(null);
        } catch (err) {
            if (err instanceof Error && err.name !== "AbortError") {
                setError(err);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (firstRenderRef.current && initialData && initialData.length > 0) {
            firstRenderRef.current = false;
            return;
        }
        const controller = new AbortController();
        fetchData(controller.signal);
        firstRenderRef.current = false;
        return () => controller.abort();
    }, [fetchData, initialData]);

    const categories = useMemo(() => getProgulCategories(data), [data]);

    const getActivasiList = useCallback((progulId: number): ActivasiCategory[] => {
        return getActivasiByProgul(data, progulId);
    }, [data]);

    const getKinerjaList = useCallback((activasiId: number): KinerjaItem[] => {
        for (const progul of data) {
            const activasi = progul.activasi.find(a => a.id === activasiId);
            if (activasi) return activasi.kinerja;
        }
        return [];
    }, [data]);

    const getProgulById = useCallback((id: number): ProgulCategory | undefined => {
        return categories.find(c => c.id === id);
    }, [categories]);

    const getActivasiById = useCallback((id: number): ActivasiCategory & { progul_id: number } | undefined => {
        for (const progul of data) {
            const activasi = progul.activasi.find(a => a.id === id);
            if (activasi) {
                return {
                    id: activasi.id,
                    name: activasi.nama,
                    progul_id: progul.id,
                    count: activasi.kinerja.length
                };
            }
        }
        return undefined;
    }, [data]);

    return {
        data,
        loading,
        error,
        categories,
        getActivasiList,
        getKinerjaList,
        getProgulById,
        getActivasiById,
        refetch: fetchData
    };
}


/**
 * @file Hooks/useProgulData.ts
 *
 * Custom hook untuk mengelola data Progul.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    fetchAllProgulData,
    getProgulCategories,
    getActivasiByProgul,
    type ProgulItem,
    type ProgulCategory,
    type ActivasiCategory
} from "@/Services/progulService";

export function useProgulData() {
    const [data, setData] = useState<ProgulItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

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
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => controller.abort();
    }, [fetchData]);

    const categories = useMemo(() => getProgulCategories(data), [data]);

    const getActivasiList = useCallback((progulId: number): ActivasiCategory[] => {
        return getActivasiByProgul(data, progulId);
    }, [data]);

    const getKinerjaList = useCallback((activasiId: number): ProgulItem[] => {
        return data.filter(item => item.id_sub_progul === activasiId);
    }, [data]);

    const getProgulById = useCallback((id: number): ProgulCategory | undefined => {
        return categories.find(c => c.id === id);
    }, [categories]);

    const getActivasiById = useCallback((id: number): ActivasiCategory | undefined => {
        const item = data.find(i => i.id_sub_progul === id);
        if (!item) return undefined;
        return {
            id: item.id_sub_progul,
            name: item.sub_progul,
            progul_id: item.id_progul,
            count: data.filter(i => i.id_sub_progul === id).length
        };
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

import { useState, useEffect, useRef } from 'react';
import { PkWakoItem, pkWakoService } from '@/Services/pk-wako-service';

/**
 * Custom hook untuk mengelola data Perjanjian Kinerja Wali Kota (PK WAKO).
 */
export const usePkWako = (initialData?: PkWakoItem[]) => {
    const [data, setData] = useState<PkWakoItem[]>(initialData || []);
    const [loading, setLoading] = useState<boolean>(!initialData);
    const [error, setError] = useState<Error | null>(null);
    const firstRenderRef = useRef(true);

    useEffect(() => {
        if (firstRenderRef.current && initialData) {
            firstRenderRef.current = false;
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await pkWakoService.getPkWakoData();
                setData(result);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Gagal mengambil data PK WAKO'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        firstRenderRef.current = false;
    }, [initialData]);

    return { data, loading, error };
};

import { useState, useEffect } from 'react';
import { PkWakoItem, pkWakoService } from '@/Services/pkWakoService';

/**
 * Custom hook untuk mengelola data Perjanjian Kinerja Wali Kota (PK WAKO).
 */
export const usePkWako = () => {
    const [data, setData] = useState<PkWakoItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
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
    }, []);

    return { data, loading, error };
};

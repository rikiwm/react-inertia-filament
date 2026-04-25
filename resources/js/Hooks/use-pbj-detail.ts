import { useState, useEffect, useCallback, useMemo } from 'react';
import { pbjDetailService, PbjDetailItem, PbjJenisTransaksi } from '@/Services/pbj-detail-service';

/**
 * Hook untuk mengelola data detail PBJ (E-Katalog, Tender, Non-Tender).
 * Menyediakan fitur filtering kompleks dan pagination.
 */
export const usePbjDetail = (initialTahun: number = 2026) => {
    const [tahun, setTahun] = useState(initialTahun);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter baru
    const [selectedSatker, setSelectedSatker] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedJenis, setSelectedJenis] = useState<PbjJenisTransaksi | 'all'>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Default 5 items per page for demo

    const [data, setData] = useState<PbjDetailItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await pbjDetailService.fetchPbjList(tahun);
            setData(result);
            setCurrentPage(1); // Reset page on year change
        } catch (err) {
            setError((err as Error).message || 'Gagal mengambil data detail PBJ');
        } finally {
            setLoading(false);
        }
    }, [tahun]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /** Ekstrak daftar unik untuk filter select */
    const filterOptions = useMemo(() => {
        const satkers = Array.from(new Set(data.map(d => d.nama_satker))).sort();
        const statuses = Array.from(new Set(data.map(d => d.status))).sort();
        const jenisTransaksis: PbjJenisTransaksi[] = ["CATALOG", "TENDER", "NON-TENDER"];

        return {
            satkers,
            statuses,
            jenisTransaksis
        };
    }, [data]);

    /** Logika pemfilteran data */
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchSearch = !searchQuery ||
                [item.rup_name, item.nama_satker, item.order_id, item.nama_penyedia]
                    .some(field => field?.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchSatker = selectedSatker === 'all' || item.nama_satker === selectedSatker;
            const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
            const matchJenis = selectedJenis === 'all' || item.jenis_transaksi === selectedJenis;

            return matchSearch && matchSatker && matchStatus && matchJenis;
        });
    }, [data, searchQuery, selectedSatker, selectedStatus, selectedJenis]);

    /** Data yang terpaginasi */
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return {
        tahun,
        setTahun,
        searchQuery,
        setSearchQuery,
        // Filter States
        selectedSatker,
        setSelectedSatker,
        selectedStatus,
        setSelectedStatus,
        selectedJenis,
        setSelectedJenis,
        // Options
        filterOptions,
        // Data & Pagination
        data: paginatedData,
        totalItems: filteredData.length,
        currentPage,
        setCurrentPage,
        totalPages,
        itemsPerPage,
        loading,
        error,
        retry: fetchData
    };
};

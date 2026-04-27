import React, { useState, useMemo, useEffect } from 'react';
import { Table } from '@/shared/components/ui/table';
import { Search, Calendar, CheckCircle2, Clock, Truck, MoreHorizontal, Building2, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/Lib/utils';
import { pbjTenderService } from '@/Services/pbj-split-service';
import { PbjDetailItem } from '@/Services/pbj-detail-service';

const fmtRupiah = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

export default function TenderTab({ tahun, searchQuery, selectedSatker, initialData }: { tahun: number, searchQuery: string, selectedSatker: string, initialData?: any[] }) {
    const [data, setData] = useState<PbjDetailItem[]>(initialData || []);
    const [loading, setLoading] = useState(!initialData);
    const isFirstRender = React.useRef(true);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        if (isFirstRender.current && initialData) {
            isFirstRender.current = false;
            return;
        }

        let isMounted = true;
        setLoading(true);
        pbjTenderService.fetchList(tahun).then(res => {
            if (isMounted) {
                setData(res);
                setLoading(false);
                setCurrentPage(1);
            }
        });

        isFirstRender.current = false;
        return () => { isMounted = false; };
    }, [tahun, initialData]);

    const filteredData = useMemo(() => {
        let result = data;

        if (selectedSatker && selectedSatker !== 'all') {
            result = result.filter(item => item.nama_satker === selectedSatker);
        }

        if (searchQuery) {
            result = result.filter(item =>
                [item.nama_paket, item.nama_rup, item.nama_satker, item.kd_tender, item.nama_penyedia]
                    .some(field => String(field ?? '').toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        return result;
    }, [data, searchQuery, selectedSatker]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="flex flex-col h-full">
            <div className="overflow-x-auto min-h-[400px]">
                <Table striped className="min-w-full">
                    <Table.Head>
                        <Table.Tr className="bg-amber-50/50 dark:bg-amber-900/10">
                            <Table.Th className="text-[10px] font-semibold uppercase text-amber-400 tracking-widest py-5 px-6">ID Transaksi</Table.Th>
                            <Table.Th className="text-[10px] font-semibold uppercase text-amber-400 tracking-widest py-5 px-6">Detail Paket</Table.Th>
                            <Table.Th className="text-[10px] font-semibold uppercase text-amber-400 tracking-widest py-5 px-6">Satker & Penyedia</Table.Th>
                            <Table.Th className="text-[10px] font-semibold uppercase text-amber-400 tracking-widest py-5 px-6">Status</Table.Th>
                            <Table.Th className="text-[10px] font-semibold uppercase text-amber-400 tracking-widest py-5 px-6 text-right">Nilai</Table.Th>
                        </Table.Tr>
                    </Table.Head>
                    <Table.Body>
                        {loading ? (
                            [...Array(itemsPerPage)].map((i) => (
                                <Table.Tr key={i} className="animate-pulse">
                                    <Table.Td colSpan={5} className="py-8 px-6">
                                        <div className="h-4 bg-slate-100 dark:bg-neutral-800 rounded-full w-full"></div>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((item) => (
                                <Table.Tr key={item.order_id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/30 transition-colors group cursor-pointer">
                                    <Table.Td className="py-5 px-6">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-md text-[9px] font-semibold border uppercase tracking-tight bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">Tender</span>
                                            <p className="text-xs font-semibold text-slate-900 dark:text-white uppercase mt-1">TND-{item.kd_tender || '-'}</p>
                                            <p className="text-[10px] text-slate-400 font-mono tracking-tight">RUP: {item.kd_rup_paket || item.kd_rup || '-'}</p>
                                        </div>
                                    </Table.Td>
                                    <Table.Td className="py-5 px-6 max-w-xs">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-neutral-200 line-clamp-2 group-hover:text-amber-600 transition-colors">{item.nama_paket || item.nama_rup}</p>
                                        <div className="flex items-center gap-1.5 mt-2 opacity-60">
                                            <Calendar className="w-3 h-3" />
                                            <span className="text-[10px] font-medium">{new Date(item.tgl_pengumuman_tender || '2024-01-01').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </Table.Td>
                                    <Table.Td className="py-5 px-6">
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2">
                                                <Building2 className="w-3 h-3 mt-0.5 text-slate-400 shrink-0" />
                                                <p className="text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase leading-tight line-clamp-1">{item.nama_satker}</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Tag className="w-3 h-3 mt-0.5 text-slate-300 shrink-0" />
                                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight line-clamp-1">{item.nama_penyedia || '-'}</p>
                                            </div>
                                        </div>
                                    </Table.Td>
                                    <Table.Td className="py-5 px-6">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Selesai
                                        </span>
                                    </Table.Td>
                                    <Table.Td className="py-5 px-6 text-right tabular-nums">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{fmtRupiah(item.nilai_kontrak || item.nilai_terkoreksi || item.pagu || 0)}</p>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        ) : (
                            <Table.Tr>
                                <Table.Td colSpan={5} className="py-24 text-center">
                                    <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs">Data tidak ditemukan</p>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Body>
                </Table>
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 dark:border-neutral-800 bg-teal-50/50 dark:bg-neutral-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                        Halaman <span className="text-neutral-600 font-semibold">{currentPage}</span> dari <span className="text-neutral-600 dark:text-neutral-300">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-500 dark:bg-teal-500 border disabled:opacity-30">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-500 dark:bg-teal-500 border disabled:opacity-30">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

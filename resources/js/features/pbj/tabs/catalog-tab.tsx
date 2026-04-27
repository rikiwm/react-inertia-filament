import React, { useState, useMemo, useEffect } from 'react';
import { Table } from '@/shared/components/ui/table';
import { Calendar, CheckCircle2, Clock, Truck, MoreHorizontal, Building2, Tag, Bookmark, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/Lib/utils';
import { pbjCatalogService } from '@/Services/pbj-split-service';
import { PbjDetailItem } from '@/Services/pbj-detail-service';

const fmtRupiah = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { label: string, color: string, icon: any }> = {
        COMPLETED: { label: "Selesai", color: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800", icon: CheckCircle2 },
        ON_PROCESS: { label: "Berjalan", color: "bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800", icon: Clock },
        SHIPPING: { label: "Pengiriman", color: "bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800", icon: Truck },
    };

    const s = config[status] || { label: status, color: "bg-neutral-100 text-neutral-600", icon: MoreHorizontal };
    const Icon = s.icon;

    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider", s.color)}>
            <Icon className="w-3 h-3" />
            {s.label}
        </span>
    );
};

export default function CatalogTab({ tahun, searchQuery, selectedSatker, initialData }: { tahun: number, searchQuery: string, selectedSatker: string, initialData?: any[] }) {
    const [data, setData] = useState<PbjDetailItem[]>(initialData || []);
    const [loading, setLoading] = useState(!initialData);
    const isFirstRender = React.useRef(true);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (isFirstRender.current && initialData) {
            isFirstRender.current = false;
            return;
        }

        let isMounted = true;
        setLoading(true);
        pbjCatalogService.fetchList(tahun).then(res => {
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
                [item.nama_paket, item.nama_satker, item.kd_paket, item.no_paket, item.nama_penyedia]
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
                <Table striped className="min-w-full mx-auto">
                    <Table.Head>
                        <Table.Tr className="bg-teal-50 dark:bg-teal-800">
                            <Table.Th className="text-[10px] font-medium uppercase text-teal-600 tracking-widest py-4 px-5">Satker</Table.Th>
                            <Table.Th className="text-[10px] font-medium uppercase text-teal-600 tracking-widest py-3 px-5">Detail Paket</Table.Th>
                            <Table.Th className="text-[10px] font-medium uppercase text-teal-600 tracking-widest py-3 px-5">MAK</Table.Th>
                            <Table.Th className="text-[10px] font-medium uppercase text-teal-600 tracking-widest py-3 px-5">Penyedia</Table.Th>
                            <Table.Th className="text-[10px] font-medium uppercase text-teal-600 tracking-widest py-3 px-5">Status</Table.Th>
                            <Table.Th className="text-[10px] font-medium uppercase text-teal-600 tracking-widest py-3 px-5 text-right">Nilai</Table.Th>
                        </Table.Tr>
                    </Table.Head>
                    <Table.Body>
                        {loading ? (
                            [...Array(itemsPerPage)].map((_, i) => (
                                <Table.Tr key={i} className="animate-pulse">
                                    <Table.Td colSpan={6} className="py-3 px-6">
                                        <div className="h-4 bg-slate-100 dark:bg-teal-800 rounded-full w-full"></div>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((item) => (
                                <Table.Tr key={item.order_id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/30 transition-colors group cursor-pointer">
                                    <Table.Td className="py-4 px-6">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-sm text-[9px] font-medium border uppercase tracking-tight bg-teal-100 text-teal-600 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800">E-Katalog</span>
                                            <p className="text-xs font-semibold text-slate-900 dark:text-white uppercase mt-1">{item.nama_satker}</p>
                                            <span className="flex items-center gap-1.5 text-[10px] font-medium">
                                                <Calendar className="w-3 h-3" />

                                                {item.kode_satker}</span>

                                            <p className="text-[10px] text-slate-400 font-mono tracking-tight">RUP: {item.rup_code || '-'}</p>
                                        </div>
                                    </Table.Td>
                                    <Table.Td className="py-4 px-6 max-w-xs">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-neutral-200 line-clamp-2 group-hover:text-indigo-600 transition-colors">{item.rup_name}</p>
                                        <div className="flex flex-col items-start gap-1.5 mt-1 opacity-60">
                                            <p className="text-[10px] font-medium">{item.rup_desc}</p>
                                            <span className="flex items-center gap-1.5 text-[10px] font-medium">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(item.order_date || '2024-01-01').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </Table.Td>

                                    {/* ── MAK Column ── */}
                                    <Table.Td className="py-4 px-6 min-w-[200px]">
                                        {item.mak ? (
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <Bookmark className="w-3 h-3 text-teal-500 shrink-0" />
                                                    <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider">MAK</span>
                                                </div>
                                                <p className="font-mono text-[11px] max-w-[400px] line-clamp-1 font-semibold text-slate-800 dark:text-neutral-200 tracking-tight leading-relaxed break-all">
                                                    {item.mak}
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-neutral-300 dark:text-neutral-700">—</span>
                                        )}
                                    </Table.Td>

                                    <Table.Td className="py-4 px-6">
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2">
                                                <Building2 className="w-3 h-3 mt-0.5 text-slate-400 shrink-0" />
                                                <p className="text-xs max-w-[150px] line-clamp-1 font-semibold text-slate-700 dark:text-neutral-300 uppercase leading-tight line-clamp-1">{item.kode_penyedia}</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Tag className="w-3 h-3 mt-0.5 text-slate-300 shrink-0" />
                                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight line-clamp-1">{item.fiscal_year}</p>
                                                <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-sm text-[9px] font-medium border uppercase tracking-tight bg-teal-100 text-indigo-600 border-indigo-200 dark:bg-teal-900/30 dark:text-lime-400 dark:border-indigo-800">{item.funding_source}</span>
                                            </div>
                                        </div>
                                    </Table.Td>
                                    <Table.Td className="py-4 px-6">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                                            <CheckCircle2 className="w-3 h-3" />
                                            {item.status}
                                        </span>
                                    </Table.Td>
                                    <Table.Td className="py-4 px-6 text-right tabular-nums">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {fmtRupiah(item.total || item.nilai_kontrak || item.pagu || 0)}
                                        </p>
                                        {item.total_qty != null && item.total_qty > 0 && (
                                            <div className="flex items-center justify-end gap-1 mt-1.5">
                                                <Layers className="w-3 h-3 text-teal-400 shrink-0" />
                                                <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 tabular-nums">
                                                    {new Intl.NumberFormat('id-ID').format(item.total_qty)} unit
                                                </span>
                                            </div>
                                        )}
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        ) : (
                            <Table.Tr>
                                <Table.Td colSpan={6} className="py-24 text-center">
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
                        Halaman <span className="text-neutral-600 font-medium">{currentPage}</span> dari <span className="text-neutral-600 dark:text-neutral-300">{totalPages}</span>
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


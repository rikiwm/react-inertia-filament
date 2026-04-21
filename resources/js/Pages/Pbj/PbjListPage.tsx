import React from 'react';
import { Head } from '@inertiajs/react';
import FrontWrapper from '@/Wrappers/FrontWrapper';
import { usePbjDetail } from '@/Hooks/usePbjDetail';
import { Table } from '@/Components/UI/Table';
import {
    Search,
    Calendar,
    Package,
    Factory,
    CheckCircle2,
    Clock,
    Truck,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Tag,
    FilterX,
    LayoutGrid
} from 'lucide-react';
import { cn } from '@/Lib/Utils';

const fmtRupiah = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

const AVAILABLE_YEARS = [2026, 2025, 2024, 2023];

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

const TypeBadge = ({ type }: { type: string }) => {
    const config: Record<string, { label: string, color: string }> = {
        CATALOG: { label: "E-Katalog", color: "bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800" },
        TENDER: { label: "Tender", color: "bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
        "NON-TENDER": { label: "Non-Tender", color: "bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800" },
    };

    const t = config[type] || { label: type, color: "bg-neutral-100 text-neutral-600" };

    return (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-tight", t.color)}>
            {t.label}
        </span>
    );
};

const PbjListPage = () => {
    const {
        tahun, setTahun,
        searchQuery, setSearchQuery,
        selectedSatker, setSelectedSatker,
        selectedStatus, setSelectedStatus,
        selectedJenis, setSelectedJenis,
        filterOptions,
        data,
        totalItems,
        currentPage, setCurrentPage,
        totalPages,
        itemsPerPage,
        loading, error
    } = usePbjDetail(2026);

    const resetFilters = () => {
        setSelectedSatker('all');
        setSelectedStatus('all');
        setSelectedJenis('all');
        setSearchQuery('');
    };

    const isFilterActive = selectedSatker !== 'all' || selectedStatus !== 'all' || selectedJenis !== 'all' || searchQuery !== '';

    return (
        <>
            <Head title={`Daftar Paket Pengadaan ${tahun}`} />

            <div className="min-h-screen w-full bg-slate-50/50 dark:bg-transparent pt-24 pb-20">
                <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                                    <Package className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-[0.2em]">
                                    Pengadaan Barang & Jasa
                                </span>
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white uppercase">
                                Rincian Paket <span className="text-teal-600">Terintegrasi</span>
                            </h1>
                            <p className="text-slate-500 dark:text-neutral-400 mt-2 max-w-2xl">
                                Data konsolidasi E-Katalog, Tender, dan Non-Tender Pemerintah Kota Padang.
                            </p>
                        </div>

                        {/* Year Selector */}
                        <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm">
                            {AVAILABLE_YEARS.map((y) => (
                                <button
                                    key={y}
                                    onClick={() => setTahun(y)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300",
                                        y === tahun
                                            ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                                            : "text-slate-500 dark:text-neutral-500 hover:bg-slate-100 dark:hover:bg-neutral-800"
                                    )}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="bg-white dark:bg-neutral-950 rounded-[2rem] border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col h-full">

                        {/* Filters & Search Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-neutral-800 space-y-4">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Main Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama paket, satker, atau penyedia..."
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-neutral-900 border-none rounded-2xl text-sm focus:ring-2 focus:ring-teal-500/20 transition-all dark:text-white"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* Quick Reset */}
                                {isFilterActive && (
                                    <button
                                        onClick={resetFilters}
                                        className="inline-flex items-center justify-center px-5 py-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-rose-100 transition-colors gap-2"
                                    >
                                        <FilterX className="w-4 h-4" />
                                        Hapus Filter
                                    </button>
                                )}
                            </div>

                            {/* Complex Filters Bar */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* SATKER Filter */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Satuan Kerja (SKPD)</label>
                                    <div className="relative group">
                                        <Factory className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                                        <select
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border-none rounded-xl text-xs font-semibold text-slate-600 dark:text-neutral-300 appearance-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                                            value={selectedSatker}
                                            onChange={(e) => setSelectedSatker(e.target.value)}
                                        >
                                            <option value="all">Semua Satker</option>
                                            {filterOptions.satkers.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status Progres</label>
                                    <div className="relative group">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                                        <select
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border-none rounded-xl text-xs font-semibold text-slate-600 dark:text-neutral-300 appearance-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                        >
                                            <option value="all">Semua Status</option>
                                            {filterOptions.statuses.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Jenis Transaksi Filter */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Jenis Transaksi</label>
                                    <div className="relative group">
                                        <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                                        <select
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border-none rounded-xl text-xs font-semibold text-slate-600 dark:text-neutral-300 appearance-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                                            value={selectedJenis}
                                            onChange={(e) => setSelectedJenis(e.target.value as any)}
                                        >
                                            <option value="all">Semua Jenis</option>
                                            <option value="CATALOG">Catalog (E-Purchasing)</option>
                                            <option value="TENDER">Tender</option>
                                            <option value="NON-TENDER">Non-Tender</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto min-h-[400px]">
                            <Table striped className="min-w-full">
                                <Table.Head>
                                    <Table.Tr className="bg-slate-50/50 dark:bg-neutral-900/50">
                                        <Table.Th className="text-[10px] font-black uppercase text-slate-400 tracking-widest py-5 px-6">Informasi Transaksi</Table.Th>
                                        <Table.Th className="text-[10px] font-black uppercase text-slate-400 tracking-widest py-5 px-6">Detail Paket</Table.Th>
                                        <Table.Th className="text-[10px] font-black uppercase text-slate-400 tracking-widest py-5 px-6">Satker & Penyedia</Table.Th>
                                        <Table.Th className="text-[10px] font-black uppercase text-slate-400 tracking-widest py-5 px-6">Status</Table.Th>
                                        <Table.Th className="text-[10px] font-black uppercase text-slate-400 tracking-widest py-5 px-6 text-right">Total Nilai</Table.Th>
                                    </Table.Tr>
                                </Table.Head>
                                <Table.Body>
                                    {loading ? (
                                        [...Array(itemsPerPage)].map((_, i) => (
                                            <Table.Tr key={i} className="animate-pulse">
                                                <Table.Td colSpan={5} className="py-8 px-6">
                                                    <div className="h-4 bg-slate-100 dark:bg-neutral-800 rounded-full w-full"></div>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))
                                    ) : data.length > 0 ? (
                                        data.map((item) => (
                                            <Table.Tr key={item.order_id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/30 transition-colors group cursor-pointer">
                                                <Table.Td className="py-5 px-6">
                                                    <div className="flex flex-col gap-1.5">
                                                        <TypeBadge type={item.jenis_transaksi} />
                                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase mt-1">{item.order_id}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono tracking-tight">RUP: {item.rup_code}</p>
                                                    </div>
                                                </Table.Td>
                                                <Table.Td className="py-5 px-6 max-w-xs">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-neutral-200 line-clamp-1 group-hover:text-teal-600 transition-colors">{item.rup_name}</p>
                                                    <p className="text-xs text-slate-400 mt-1 italic line-clamp-1">{item.rup_desc}</p>
                                                    <div className="flex items-center gap-1.5 mt-2 opacity-60">
                                                        <Calendar className="w-3 h-3" />
                                                        <span className="text-[10px] font-medium">{new Date(item.order_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                </Table.Td>
                                                <Table.Td className="py-5 px-6">
                                                    <div className="space-y-2">
                                                        <div className="flex items-start gap-2">
                                                            <Building2 className="w-3 h-3 mt-0.5 text-slate-400 shrink-0" />
                                                            <p className="text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase leading-tight">{item.nama_satker}</p>
                                                        </div>
                                                        <div className="flex items-start gap-2">
                                                            <Tag className="w-3 h-3 mt-0.5 text-slate-300 shrink-0" />
                                                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight line-clamp-1">{item.nama_penyedia || item.kode_penyedia}</p>
                                                        </div>
                                                    </div>
                                                </Table.Td>
                                                <Table.Td className="py-5 px-6">
                                                    <StatusBadge status={item.status} />
                                                </Table.Td>
                                                <Table.Td className="py-5 px-6 text-right tabular-nums">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{fmtRupiah(item.total)}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">{item.total_qty} <span className="font-medium opacity-70">Item</span></p>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))
                                    ) : (
                                        <Table.Tr>
                                            <Table.Td colSpan={5} className="py-24 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-5 rounded-[2rem] bg-slate-50 dark:bg-neutral-900 text-slate-200">
                                                        <Search className="w-12 h-12" />
                                                    </div>
                                                    <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs">Data tidak ditemukan</p>
                                                    <p className="text-slate-300 text-xs">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                                                </div>
                                            </Table.Td>
                                        </Table.Tr>
                                    )}
                                </Table.Body>
                            </Table>
                        </div>

                        {/* Pagination Footer */}
                        {!loading && totalPages > 1 && (
                            <div className="p-6 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/30 dark:bg-neutral-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                    Halaman <span className="text-teal-600 font-black">{currentPage}</span> dari <span className="text-slate-600 dark:text-slate-300">{totalPages}</span>
                                    <span className="ml-4 opacity-50">•</span>
                                    <span className="ml-4 tabular-nums">Total {totalItems} Data</span>
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-400 hover:text-teal-600 hover:border-teal-500 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    <div className="flex items-center gap-1.5 px-1">
                                        {[...Array(totalPages)].map((_, i) => {
                                            const page = i + 1;
                                            // Tampilkan semua jika sedikit, atau gunakan ellipsys jika banyak (logic sederhana untuk demo)
                                            if (totalPages > 5 && Math.abs(page - currentPage) > 1 && page !== 1 && page !== totalPages) {
                                                if (page === 2 || page === totalPages - 1) return <span key={page} className="text-slate-300 px-1">...</span>;
                                                return null;
                                            }
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={cn(
                                                        "h-10 min-w-[2.5rem] px-2 rounded-xl text-xs font-black transition-all",
                                                        currentPage === page
                                                            ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                                                            : "bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-400 hover:border-teal-500 hover:text-teal-600"
                                                    )}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-400 hover:text-teal-600 hover:border-teal-500 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

// Helper components for Satker/Status labels in the table
const Building2 = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-10h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

PbjListPage.layout = (page: React.ReactNode) => <FrontWrapper>{page}</FrontWrapper>;

export default PbjListPage;

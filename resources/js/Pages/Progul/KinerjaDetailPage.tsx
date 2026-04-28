import React, { useMemo, useState } from 'react';
import { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontWrapper from '@/Wrappers/front-wrapper';
import { useProgulData } from '@/features/progul/hooks/use-progul-data';
import { motion, AnimatePresence } from 'motion/react';
import {
    ChevronLeft,
    Table as TableIcon,
    Calendar,
    Building2,
    CheckCircle2,
    BarChart,
    Target as TargetIcon,
    TrendingUp,
    CheckCircle,
    Search,
    Filter,
    XCircle,
    Package,
    Hash
} from 'lucide-react';
import { cn } from '@/Lib/utils';

interface Props {
    id: number;
    initialProgulData?: any[];
}

const KinerjaDetailPage = ({ id, initialProgulData }: Props) => {
    const { getKinerjaList, getActivasiById, loading } = useProgulData(initialProgulData);
    const [searchQuery, setSearchQuery] = useState('');
    const [perangkatFilter, setPerangkatFilter] = useState('all');

    const activasi = useMemo(() => getActivasiById(id), [getActivasiById, id]);
    const kinerjaList = useMemo(() => getKinerjaList(id), [getKinerjaList, id]);

    // Get unique perangkat daerah for the filter
    const perangkatDaerahOptions = useMemo(() => {
        const unique = new Set<string>();
        kinerjaList.forEach(item => {
            if (item.perangkat_daerah) unique.add(item.perangkat_daerah);
        });
        return Array.from(unique).sort();
    }, [kinerjaList]);

    // Filtered list based on search and select
    const filteredKinerja = useMemo(() => {
        return kinerjaList.filter(item => {
            const matchesSearch = item.indikator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.nama_kinerja.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPerangkat = perangkatFilter === 'all' || item.perangkat_daerah === perangkatFilter;
            return matchesSearch && matchesPerangkat;
        });
    }, [kinerjaList, searchQuery, perangkatFilter]);

    return (
        <>
            <Head title={`${activasi?.name || 'Detail'} - Capaian Kinerja`} />
            <div className="min-h-screen w-full bg-slate-50/50 dark:bg-transparent pt-4 pb-20">
                <div className="max-w-screen-2xl mx-auto px-4 lg:px-0 space-y-6">

                    {/* Header Section */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                {activasi?.name}
                            </h1>
                            <div className="flex flex-wrap gap-4 mt-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-md bg-lime-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Tahun 2025 - 2029
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-md bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-xs font-bold">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    {kinerjaList.length} Indikator Kinerja
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-neutral-400">
                        Pantau kinerja dan capaian program unggulan pemerintah Kota Padang untuk mewujudkan masyarakat yang lebih sejahtera dan mandiri.
                    </p>
                    {/* Filters Section */}
                    <div className="mb-2 px-3 md:px-0 max-w-screen-2xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-teal-950/10 p-2 rounded-2xl border border-neutral-200 dark:border-teal-950 shadow-xs">
                            <div className="relative col-span-2">
                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-neutral-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari indikator atau kinerja..."
                                    className="text-teal-900 block w-full pl-10 pr-3 py-2.5 border border-neutral-200 dark:border-teal-950 rounded-lg bg-neutral-50 dark:bg-teal-950/10 text-sm dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Filter className="h-4 w-4 text-teal-400 dark:text-neutral-100" />
                                </div>
                                <select
                                    className="block w-full pl-10 pr-2 py-2.5 border border-neutral-200 dark:border-teal-950 rounded-lg bg-neutral-50 dark:bg-teal-950/10 text-sm text-teal-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none"
                                    value={perangkatFilter}
                                    onChange={(e) => setPerangkatFilter(e.target.value)}
                                >
                                    <option value="all">Semua Perangkat Daerah</option>
                                    {perangkatDaerahOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Indicators List */}
                    <div className="space-y-3 px-4 md:px-0 max-w-8xl mx-auto">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="h-64 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-teal-800 animate-pulse">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-2">
                                        <div className="flex-row flex justify-center items-center w-full">
                                            <div className="flex items-center gap-2">
                                                <span className="w-8 h-8 w-screen-md rounded-lg bg-neutral-600 text-white flex items-center justify-center text-xs font-bold shrink-0">  </span>
                                                <span className="w-8 h-8 rounded-lg bg-neutral-600 text-white flex items-center justify-center text-xs font-bold shrink-0">  </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : filteredKinerja.length > 0 ? (
                            <AnimatePresence mode="popLayout">
                                {filteredKinerja.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: [0, 1], y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="bg-white dark:bg-zinc-950/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden"
                                    >
                                        {/* Indicator Header */}
                                        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                            {(index + 1).toString().padStart(2, '0')}
                                                        </span>
                                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                                            {item.indikator}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-start md:ml-11">
                                                        <BarChart className="w-4 h-4 mr-2 mt-0.5 text-teal-600 shrink-0" />
                                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                                                            {item.nama_kinerja}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 shrink-0">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-amber-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-black uppercase tracking-wider">
                                                        Satuan: {item.satuan}
                                                    </span>
                                                    <div className="flex items-center text-right">
                                                        <div className="mr-3">
                                                            <p className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-200 uppercase">
                                                                {item.perangkat_daerah}
                                                            </p>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/10 flex items-center justify-center text-teal-600">
                                                            <Building2 className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Yearly Performance Section */}
                                        <div className="p-4">
                                            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4 flex items-center">
                                                <TrendingUp className="w-3 h-3 mr-2" />
                                                Kinerja Pertahun (2025 - 2029)
                                            </h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                                {item.years.map((yearData) => (
                                                    <div
                                                        key={yearData.tahun}
                                                        className={cn(
                                                            "p-4 rounded-lg border transition-all duration-300",
                                                            yearData.capaian ? "bg-teal-50/30 border-teal-100 dark:bg-teal-900/10 dark:border-teal-900/30" : "bg-neutral-50 dark:bg-zinc-950/50 border-neutral-100 dark:border-neutral-800"
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-sm font-black text-neutral-900 dark:text-neutral-100">{yearData.tahun}</span>
                                                            {yearData.capaian && <CheckCircle className="w-3 h-3 text-teal-600" />}
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <p className="text-[10px] text-red-900 font-semibold uppercase tracking-tighter">Target</p>
                                                                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                                                                    {yearData.target || "-"}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-teal-900 font-semibold uppercase tracking-tighter">Capaian</p>
                                                                <div className="flex items-baseline gap-2">
                                                                    <p className="text-sm font-semibold text-teal-600">
                                                                        {yearData.capaian || "-"}
                                                                    </p>
                                                                    {yearData.persen && (
                                                                        <span className="text-[10px] font-semibold text-teal-500 bg-teal-50 dark:bg-teal-900/20 px-1.5 py-0.5 rounded">
                                                                            {yearData.persen}%
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center p-20 bg-white dark:bg-neutral-900 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800"
                            >
                                <XCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                                <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                                    Tidak ada data yang cocok dengan filter pencarian Anda.
                                </p>
                                <button
                                    onClick={() => { setSearchQuery(''); setPerangkatFilter('all'); }}
                                    className="mt-4 text-teal-600 text-sm font-semibold hover:underline"
                                >
                                    Reset Filter
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div >
            </div >
        </>
    );
};

KinerjaDetailPage.layout = (page: ReactNode) => <FrontWrapper title={'Kinerja Program Unggulan Kota Padang'}>{page}</FrontWrapper>;

export default KinerjaDetailPage;



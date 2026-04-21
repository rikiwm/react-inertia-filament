import React, { useMemo, useState } from 'react';
import { ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import FrontWrapper from '@/Wrappers/FrontWrapper';
import { usePkWako } from '@/Hooks/usePkWako';
import { motion, AnimatePresence } from 'motion/react';
import {
    Search,
    Filter,
    BarChart3,
    Target,
    Users,
    ChevronRight,
    TrendingUp,
    FileText,
    Info
} from 'lucide-react';
import { cn } from '@/Lib/Utils';

const PkWakoPage = () => {
    const { data, loading, error } = usePkWako();
    const [searchQuery, setSearchQuery] = useState('');

    // Filtered data based on search
    const filteredData = useMemo(() => {
        return data.filter(item =>
            item.sasaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.indikator.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.skpd.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [data, searchQuery]);

    return (
        <>
            <Head title="PK WAKO - Perjanjian Kinerja Wali Kota" />

            <div className="min-h-screen bg-transparent pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                    Perjanjian Kinerja Wali Kota
                                </h1>
                                <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                                    Perjanjian Kinerja Wali Kota Padang
                                </p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                <div className="flex items-center gap-3 text-teal-600 mb-2">
                                    <Target className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Total Indikator</span>
                                </div>
                                <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">{data.length}</p>
                            </div>
                            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                <div className="flex items-center gap-3 text-blue-700 mb-2">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Tahun Anggaran</span>
                                </div>
                                <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">2026</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Filters Section */}
                    <div className="mb-6">
                        <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-neutral-900 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-neutral-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari sasaran, indikator, atau SKPD..."
                                    className="block w-full pl-10 pr-2 py-2.5 border border-neutral-200 text-teal-600 dark:border-neutral-800 rounded-md bg-neutral-50 dark:bg-neutral-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-md border border-neutral-200 dark:border-neutral-800 text-neutral-500 text-sm font-medium">
                                <Filter className="w-4 h-4" />
                                <span>Filter Aktif: Semua Data</span>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-[#f8fbff] dark:bg-teal-950/20 border-b border-neutral-200 dark:border-neutral-800">
                                        <th className="px-6 py-4 text-xs font-bold text-teal-950 dark:text-teal-400 uppercase tracking-widest">Sasaran</th>
                                        <th className="px-6 py-4 text-xs font-bold text-teal-950 dark:text-teal-400 uppercase tracking-widest">Indikator</th>
                                        <th className="px-6 py-4 text-xs font-bold text-teal-950 dark:text-teal-400 uppercase tracking-widest text-center">Target</th>
                                        <th className="px-6 py-4 text-xs font-bold text-teal-950 dark:text-teal-400 uppercase tracking-widest text-center">Capaian</th>
                                        <th className="px-6 py-4 text-xs font-bold text-teal-950 dark:text-teal-400 uppercase tracking-widest">SKPD Penanggung Jawab</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="px-6 py-8">
                                                    <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-full"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : filteredData.length > 0 ? (
                                        filteredData.map((item, idx) => (
                                            <motion.tr
                                                key={item.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors group"
                                            >
                                                <td className="px-6 py-5 text-sm font-medium text-neutral-900 dark:text-neutral-100 align-top max-w-[250px]">
                                                    {item.sasaran}
                                                </td>
                                                <td className="px-6 py-5 text-sm text-neutral-600 dark:text-neutral-400 align-top">
                                                    <div className="flex items-start gap-2">
                                                        <ChevronRight className="w-4 h-4 mt-0.5 text-teal-500 shrink-0" />
                                                        <span>{item.indikator}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-sm font-bold text-neutral-900 dark:text-neutral-100 text-center align-top tabular-nums">
                                                    {item.target}
                                                </td>
                                                <td className="px-6 py-5 text-sm text-neutral-400 dark:text-neutral-500 text-center align-top">
                                                    {item.capaian}
                                                </td>
                                                <td className="px-6 py-5 text-sm text-neutral-700 dark:text-neutral-300 align-top">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                                        <span className="leading-relaxed">{item.skpd}</span>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Info className="w-10 h-10 text-neutral-300" />
                                                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                                                        Tidak ada data yang ditemukan untuk pencarian "{searchQuery}"
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-8 flex items-center justify-between text-xs text-neutral-400 uppercase font-black tracking-[0.2em]">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-teal-500" />
                            <span>Update terakhir: April 2026</span>
                        </div>
                        <div>PEMERINTAH KOTA PADANG</div>
                    </div>
                </div>
            </div>
        </>
    );
};

PkWakoPage.layout = (page: ReactNode) => <FrontWrapper>{page}</FrontWrapper>;

export default PkWakoPage;

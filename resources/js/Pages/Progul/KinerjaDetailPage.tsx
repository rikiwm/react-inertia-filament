import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontWrapper from '@/Wrappers/FrontWrapper';
import { useProgulData } from '@/Hooks/useProgulData';
import { motion } from 'motion/react';
import {
    ChevronLeft,
    Table as TableIcon,
    Calendar,
    Building2,
    CheckCircle2,
    BarChart
} from 'lucide-react';
import { cn } from '@/Lib/Utils';

interface Props {
    id: number;
}

const KinerjaDetailPage = ({ id }: Props) => {
    const { getKinerjaList, getActivasiById, loading } = useProgulData();

    const activasi = useMemo(() => getActivasiById(id), [getActivasiById, id]);
    const kinerjaList = useMemo(() => getKinerjaList(id), [getKinerjaList, id]);

    return (
        <FrontWrapper title={activasi?.name || "Detail Kinerja"}>
            <Head title={`${activasi?.name || 'Detail'} - Capaian Kinerja`} />

            <div className="min-h-screen bg-transparent pt-18 pb-20">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumbs */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8"
                    >
                        <Link
                            href={activasi ? route('progul.detail', { id: activasi.progul_id }) : route('progul')}
                            className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-teal-600 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Kembali ke Daftar Activasi
                        </Link>
                    </motion.div>

                    {/* Header */}
                    <div className="mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
                                {activasi?.name}
                            </h1>
                            <div className="flex flex-wrap gap-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Tahun 2025
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-xs font-bold">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    {kinerjaList.length} Indikator Kinerja
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Table Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-neutral-200/50 dark:shadow-none overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
                                        <th className="px-6 py-5 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">No</th>
                                        <th className="px-6 py-5 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Kinerja & Indikator</th>
                                        <th className="px-6 py-5 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Satuan</th>
                                        <th className="px-6 py-5 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Perangkat Daerah</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan={4} className="px-6 py-4">
                                                    <div className="h-12 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-xl" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : kinerjaList.length > 0 ? (

                                        kinerjaList.map((item, index) => (
                                            <tr key={index} className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                                <td className="px-6 py-6 text-sm font-medium text-neutral-400 tabular-nums">
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="mb-2">
                                                        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-teal-600 transition-colors">
                                                            {item.indikator}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <BarChart className="w-3 h-3 mr-2 mt-0.5 text-teal-500" />
                                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed italic">
                                                            {item.kinerja}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-black uppercase tracking-wider">
                                                        {item.satuan}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/10 flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                                            <Building2 className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                                                {item.short_name || item.nama_satker}
                                                            </p>
                                                            <p className="text-[10px] text-neutral-500 dark:text-neutral-500 mt-0.5 tabular-nums">
                                                                {item.kode_satker}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-500 font-medium">
                                                Tidak ada data kinerja untuk activasi ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>
        </FrontWrapper>
    );
};

export default KinerjaDetailPage;

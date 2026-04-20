import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontWrapper from '@/Wrappers/FrontWrapper';
import { useProgulData } from '@/Hooks/useProgulData';
import { motion } from 'motion/react';
import {
    ChevronLeft,
    Activity,
    Target,
    BarChart3,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/Lib/Utils';

interface Props {
    id: number;
}

const ActivasiPage = ({ id }: Props) => {
    const { getActivasiList, getProgulById, loading } = useProgulData();

    const progul = useMemo(() => getProgulById(id), [getProgulById, id]);
    const activasiList = useMemo(() => getActivasiList(id), [getActivasiList, id]);

    return (
        <FrontWrapper title={progul?.name || "Activasi Progul"}>
            <Head title={`${progul?.name || 'Progul'} - Detail Activasi`} />

            <div className="min-h-screen bg-transparent pt-18 pb-20">
                <div className="max-w-7xl mx-auto ">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8"
                    >
                        <Link
                            href={route('progul')}
                            className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-teal-600 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Kembali ke Daftar Program
                        </Link>
                    </motion.div>

                    {/* Header Section */}
                    <div className="mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                                {progul?.name}
                            </h1>
                            <p className="text-neutral-600 dark:text-neutral-400 font-medium">
                                Pilih salah satu activasi untuk melihat detail capaian kinerja.
                            </p>
                        </motion.div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-40 rounded-3xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                            ))}
                        </div>
                    )}

                    {/* Activasi Cards Grid */}
                    {!loading && activasiList.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.1 }
                                }
                            }}
                        >
                            {activasiList.map((activasi) => (
                                <motion.div
                                    key={activasi.id}
                                    variants={{
                                        hidden: { opacity: 0, scale: 0.95 },
                                        visible: { opacity: 1, scale: 1 }
                                    }}
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <Link
                                        href={route('progul.activasi', { id: activasi.id })}
                                        className={cn(
                                            "block p-4 rounded-xl border bg-white dark:bg-neutral-900",
                                            "border-neutral-200 dark:border-neutral-800",
                                            "hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300",
                                            "group"
                                        )}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-xs font-bold mb-4">
                                                    <Activity className="w-3 h-3 mr-1" />
                                                    Activasi
                                                </div>
                                                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-teal-600 transition-colors leading-tight mb-2">
                                                    {activasi.name}
                                                </h3>
                                                <div className="flex items-center text-neutral-500 dark:text-neutral-400 text-sm">
                                                    <BarChart3 className="w-4 h-4 mr-2 text-teal-500/50" />
                                                    {activasi.count} Indikator Kinerja
                                                </div>
                                            </div>

                                            <div className="ml-4 w-8 h-8 rounded-2xl bg-teal-400 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : !loading && (
                        <div className="text-center p-12 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                            <Target className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                            <p className="text-neutral-500 dark:text-neutral-400 font-medium">Belum ada data activasi untuk program ini.</p>
                        </div>
                    )}
                </div>
            </div>
        </FrontWrapper>
    );
};

export default ActivasiPage;

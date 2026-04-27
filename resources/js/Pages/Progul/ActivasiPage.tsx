import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontWrapper from '@/Wrappers/front-wrapper';
import { useProgulData } from '@/features/progul/hooks/use-progul-data';
import { motion, AnimatePresence } from 'motion/react';
import { ReactNode, useState } from 'react';
import {
    ChevronLeft,
    Activity,
    Target,
    BarChart3,
    ArrowRight,
    Package,
    LayoutDashboard,
    Camera,
    Newspaper
} from 'lucide-react';
import { cn } from '@/Lib/utils';
import { HashtagNews } from '@/features/progul/components/hashtag-news';

interface Props {
    id: number;
    progulName?: string;
    hashtagNews?: any[];
    initialProgulData?: any[];
}

const ActivasiPage = ({ id, progulName, hashtagNews, initialProgulData }: Props) => {
    const [activeTab, setActiveTab] = useState('overview');
    const { getActivasiList, getProgulById, loading } = useProgulData(initialProgulData);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, desc: 'Data Activasi Progul' },
        { id: 'documentation', label: 'Dokumentasi', icon: Camera, desc: 'Scraping Data Progul' },
    ];

    const progul = useMemo(() => getProgulById(id), [getProgulById, id]);
    const activasiList = useMemo(() => getActivasiList(id), [getActivasiList, id]);

    return (
        <>
            <Head title={`${progul?.name || 'Progul'} - Detail Activasi`} />
            <div className="min-h-screen w-full bg-slate-50/50 dark:bg-transparent pt-4 pb-20">
                <div className="max-w-screen-2xl mx-auto px-4 lg:px-0 space-y-6">

                    {/* Header Section */}
                    <div className="flex lg:flex-row md:flex-row flex-row justify-start items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-xl shadow-teal-500/20">
                            <Package className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="lg:text-4xl md:text-3xl text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tighter">
                                {progul?.name}
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider">
                                    <Activity className="w-3 h-3" />
                                    {activasiList.length} Activasi
                                </div>
                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Program Unggulan Kota Padang</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <p className="text-slate-500 dark:text-neutral-400 max-w-3xl text-sm font-medium">
                            Pantau kinerja dan capaian program unggulan pemerintah Kota Padang untuk mewujudkan masyarakat yang lebih sejahtera dan mandiri.
                        </p>

                        {/* Tabs Navigation */}
                        <div className="flex flex-wrap items-center gap-2 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md p-1 rounded-4xl border border-neutral-200 dark:border-neutral-800 w-fit">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "relative flex items-center gap-3 px-5 py-2.5 rounded-full transition-all duration-300",
                                            isActive
                                                ? "text-white"
                                                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabProgul"
                                                className="absolute inset-0 bg-teal-600 rounded-full"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <Icon className={cn("w-4 h-4 relative z-10", isActive ? "text-white" : "text-neutral-500")} />
                                        <span className="relative z-10 text-xs font-bold uppercase tracking-wider">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                {/* Loading State */}
                                {loading && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="h-36 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
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
                                                        "block p-3 rounded-xl border bg-white/20 dark:bg-neutral-900",
                                                        "border-neutral-200 dark:border-neutral-800",
                                                        "hover:border-teal-500/50 hover:bg-white hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300",
                                                        "group"
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="inline-flex items-center px-2 py-1 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-xs font-bold mb-4">
                                                                <Activity className="w-3 h-3 mr-1" />
                                                                Activasi
                                                            </div>
                                                            <h3 className="text-lg text-neutral-900 dark:text-neutral-100 group-hover:text-teal-600 transition-colors leading-tight mb-1 px-2 line-clamp-1">
                                                                {activasi.name}
                                                            </h3>
                                                            <div className="flex items-center text-neutral-500 dark:text-neutral-400 text-sm px-2">
                                                                <BarChart3 className="w-3 h-3 mr-2 text-teal-500/50" />
                                                                {activasi.count} Indikator Kinerja
                                                            </div>
                                                        </div>

                                                        <div className="ml-4 w-8 h-8 rounded-md bg-teal-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-teal-200 group-hover:text-white transition-all duration-300">
                                                            <ArrowRight className="w-4 h-4 text-teal-950" />
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
                            </motion.div>
                        )}

                        {activeTab === 'documentation' && (
                            <motion.div
                                key="documentation"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className='px-6 mx-auto'
                            >
                                <HashtagNews
                                    news={hashtagNews || []}
                                    title={progulName}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
};
ActivasiPage.layout = (page: ReactNode) => <FrontWrapper title="Activasi Program Unggulan Kota Padang">{page}</FrontWrapper>;

export default ActivasiPage;

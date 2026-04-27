import React from 'react';
import FrontWrapper from '@/Wrappers/front-wrapper';
import { motion, AnimatePresence } from 'motion/react';
import {
    Cloud, MapPin, Wind, AlertTriangle, Info, ChevronRight,
    Activity, Radar, Newspaper, LayoutDashboard
} from 'lucide-react';
import { cn } from '@/Lib/utils';
import {
    WeatherWidget,
    IspuWidget,
    DisasterMap,
    DisasterNews,
} from "@/features/kebencanaan/components";

interface KebencanaanPageProps {
    weather: any;
    ispu: any;
    disasterMap: any[];
    disasterNews: any[];
    lastUpdate: string;
}

const KebencanaanPage = ({ weather, ispu, disasterMap, disasterNews, lastUpdate }: KebencanaanPageProps) => {
    const [activeTab, setActiveTab] = React.useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, desc: 'Data Cuaca & Udara' },
        { id: 'monitoring', label: 'Monitoring', icon: Radar, desc: 'Peta Kejadian' },
        { id: 'news', label: 'Berita / Isu', icon: Newspaper, desc: 'Informasi Terkini' },
    ];

    return (
        <div className="min-h-screen w-full pt-4 pb-32 px-4 lg:px-2  overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-teal-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Header Section */}
            <div className="max-w-screen-2xl mx-auto mb-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-teal-500/20 rounded-xl">
                                <AlertTriangle className="w-6 h-6 text-teal-600" />
                            </div>
                            <h1 className="text-4xl md:text-4xl font-bold text-neutral-900 dark:text-white uppercase tracking-tighter leading-none">
                                Informasi <span className="text-teal-600">Kebencanaan</span>
                            </h1>
                        </div>

                        <p className="mt-2 text-neutral-500 dark:text-neutral-400 max-w-2xl text-xs lg:text-sm font-medium leading-relaxed">
                            Pusat kendali monitoring kondisi cuaca, kualitas udara, dan titik kejadian bencana di Kota Padang secara real-time.
                        </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                Terakhir Diperbarui: {lastUpdate}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tabs Navigation */}
            <div className="max-w-screen-2xl mx-auto mb-2">
                <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md p-1 rounded-4xl border border-neutral-200 dark:border-neutral-800 w-fit">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "relative flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300",
                                    isActive
                                        ? "text-white"
                                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-teal-600 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <Icon className={cn("w-5 h-5 relative z-10", isActive ? "text-white" : "text-neutral-500")} />
                                <div className="relative z-10 flex flex-col items-start">
                                    <span className="text-xs font-bold uppercase tracking-wider leading-none">{tab.label}</span>
                                    {/* <span className={cn("text-[10px] font-medium opacity-60 mt-1", isActive ? "text-teal-100" : "text-neutral-400")}>
                                        {tab.desc}
                                    </span> */}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="max-w-screen-2xl mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-2 mb-10">
                                <div className="lg:col-span-4 space-y-3">
                                    <WeatherWidget data={weather} />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 mb-4">
                                                <Wind className="w-6 h-6" />
                                            </div>
                                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Status Udara</p>
                                            <p className="text-xl font-bold text-neutral-800 dark:text-white uppercase truncate">
                                                {ispu?.status_stasiun?.[0]?.kategori?.keterangan || 'Memuat...'}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 mb-4">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Titik Kejadian</p>
                                            <p className="text-xl font-bold text-neutral-800 dark:text-white uppercase">
                                                {disasterMap?.length || 0} Lokasi
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-8">
                                    <IspuWidget data={ispu} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'monitoring' && (
                        <motion.div
                            key="monitoring"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="min-h-[600px]"
                        >
                            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-4 h-fit shadow-2xl overflow-hidden relative group">
                                <div className="absolute top-8 left-8 z-10">
                                    <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4 shadow-xl">
                                        <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
                                        <div>
                                            <span className="block text-sm font-bold text-neutral-800 dark:text-white uppercase tracking-wider">Live Map Kejadian</span>
                                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{disasterMap?.length || 0} Titik Terdeteksi</span>
                                        </div>
                                    </div>
                                </div>
                                <DisasterMap points={disasterMap} />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'news' && (
                        <motion.div
                            key="news"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <DisasterNews news={disasterNews} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Emergency Contact */}
                {/* <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className=" p-10 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xl mt-24 relative overflow-hidden"
                >
                    <div className=" bg-teal-500/20 rounded-full blur-[80px]" />
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-center md:text-left flex items-center gap-6">
                            <div className="hidden sm:flex w-16 h-16 rounded-xl bg-teal-500/20 items-center justify-center text-teal-400">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-3xl font-bold mb-2 uppercase tracking-tighter">Butuh Bantuan Darurat?</h4>
                                <p className="text-neutral-400 dark:text-neutral-500 font-medium max-w-xl">
                                    Layanan panggilan darurat 112 tersedia 24 jam untuk laporan bencana, kebakaran, dan situasi medis mendesak di wilayah Kota Padang.
                                </p>
                            </div>
                        </div>
                        <a
                            href="tel:112"
                            className="group px-10 py-5 bg-teal-600 hover:bg-teal-500 text-white rounded-[2rem] font-bold text-xl transition-all shadow-2xl shadow-teal-500/20 active:scale-95 flex items-center gap-3"
                        >
                            CALL 112
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </motion.div> */}
            </div>
        </div>
    );
};

KebencanaanPage.layout = (page: React.ReactNode) => (
    <FrontWrapper title="Info Kebencanaan">{page}</FrontWrapper>
);

export default KebencanaanPage;

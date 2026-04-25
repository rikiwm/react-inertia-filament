import React from 'react';
import FrontWrapper from '@/Wrappers/front-wrapper';
import { motion } from 'motion/react';
import { Cloud, MapPin, Wind, AlertTriangle, Info, ChevronRight } from 'lucide-react';
import { cn } from '@/Lib/utils';
import {
    WeatherWidget,
    IspuWidget,
    DisasterMap,
} from "@/features/kebencanaan/components";

interface KebencanaanPageProps {
    weather: any;
    ispu: any;
    disasterMap: any[];
    lastUpdate: string;
}

const KebencanaanPage = ({ weather, ispu, disasterMap, lastUpdate }: KebencanaanPageProps) => {
    return (
        <div className="min-h-screen w-full pt-4 pb-20 px-4 md:px-8 lg:px-0  overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-teal-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-red-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Header Section */}
            <div className="max-w-screen-2xl mx-auto mb-10">
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
                            <span className="text-sm font-bold text-teal-600 uppercase tracking-[0.2em]">Monitoring Kota</span>
                        </div>
                        <h1 className="text-4xl md:text-4xl font-bold text-neutral-900 dark:text-white uppercase tracking-tighter leading-none">
                            Informasi <span className="text-teal-600">Kebencanaan</span>
                        </h1>
                        <p className="mt-4 text-neutral-500 dark:text-neutral-400 max-w-2xl text-lg font-medium leading-relaxed">
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

            <div className="max-w-screen-2xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                    {/* Left Column: Weather + Summary Cards */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <WeatherWidget data={weather} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 mb-4">
                                    <Wind className="w-5 h-5" />
                                </div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Status Udara</p>
                                <p className="text-lg font-bold text-neutral-800 dark:text-white uppercase truncate">
                                    {ispu?.status_stasiun?.[0]?.kategori?.keterangan || 'Memuat...'}
                                </p>
                            </div>
                            <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 mb-4">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Titik Kejadian</p>
                                <p className="text-lg font-bold text-neutral-800 dark:text-white uppercase">
                                    {disasterMap?.length || 0} Lokasi
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Map */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="h-full min-h-[500px] lg:min-h-full"
                        >
                            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 h-full shadow-xl overflow-hidden relative group">
                                {/* <div className="absolute top-8 left-8 z-10">
                                    <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md px-5 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-3 shadow-lg">
                                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-sm font-bold text-neutral-800 dark:text-white uppercase tracking-wider">Live Map Kejadian</span>
                                    </div>
                                </div> */}
                                <DisasterMap points={disasterMap} />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ISPU Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mb-3"
                >
                    <IspuWidget data={ispu} />
                </motion.div>

                {/* Emergency Contact */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-12 p-10 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />
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
                </motion.div>
            </div>
        </div>
    );
};

KebencanaanPage.layout = (page: React.ReactNode) => (
    <FrontWrapper title="Info Kebencanaan">{page}</FrontWrapper>
);

export default KebencanaanPage;

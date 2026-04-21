import React from 'react';
import FrontWrapper from '@/Wrappers/FrontWrapper';
import { motion } from 'motion/react';
import { Cloud, MapPin, Wind, AlertTriangle, Info } from 'lucide-react';
import WeatherWidget from '@/Components/Disaster/WeatherWidget';
import IspuWidget from '@/Components/Disaster/IspuWidget';
import DisasterMap from '@/Components/Disaster/DisasterMap';
import { cn } from '@/Lib/Utils';

interface KebencanaanPageProps {
    weather: any;
    ispu: any[];
    disasterMap: any[];
}

const KebencanaanPage = ({ weather, ispu, disasterMap }: KebencanaanPageProps) => {
    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 lg:px-12">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-black dark:text-white uppercase tracking-tighter">
                            Info <span className="text-teal-500">Kebencanaan</span>
                        </h1>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl text-lg leading-relaxed">
                        Monitoring real-time kondisi cuaca, kualitas udara, dan titik kejadian bencana di wilayah Kota Padang untuk kesiapsiagaan bersama.
                    </p>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                    {/* Weather Column */}
                    <div className="lg:col-span-4 flex flex-col">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="h-full"
                        >
                            <WeatherWidget data={weather} />
                        </motion.div>
                    </div>

                    {/* Map Column */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <div className="bg-white/5 dark:bg-black/40 rounded-2xl border border-teal-500/20 p-2 h-full shadow-2xl relative">
                                <div className="absolute top-6 left-6 z-10 pointer-events-none">
                                    <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-teal-400" />
                                        <span className="text-sm font-bold text-white uppercase tracking-wider">Peta Kejadian Bencana</span>
                                    </div>
                                </div>
                                <DisasterMap points={disasterMap} />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ISPU Full Width Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mb-8"
                >
                    <IspuWidget raw={ispu} />
                </motion.div>

                {/* Information Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-white/5"
                >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h4 className="text-xl font-bold text-black dark:text-white mb-1">Butuh Bantuan Darurat?</h4>
                            <p className="text-neutral-500 dark:text-neutral-400">Segera hubungi layanan darurat Kota Padang jika terjadi situasi bencana.</p>
                        </div>
                        <div className="flex gap-4">
                            <a href="tel:112" className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-red-500/20 active:scale-95 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                CALL 112
                            </a>
                        </div>
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

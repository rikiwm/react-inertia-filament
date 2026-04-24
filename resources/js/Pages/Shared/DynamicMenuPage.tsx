import React from 'react';
import { Head } from '@inertiajs/react';
import FrontWrapper from '@/Wrappers/FrontWrapper';
import { motion } from 'motion/react';
import {
    Construction,
    Rocket,
    Timer,
    ArrowLeft,
    Github,
    Twitter,
    Globe,
    Sparkles,
    Home
} from 'lucide-react';
import { Button } from '@/Components/UI/Button';

interface DynamicMenuPageProps {
    title?: string;
    path?: string;
}

const DynamicMenuPage = ({ title, path }: DynamicMenuPageProps) => {
    return (
        <>
            <Head title={title ? `${title} - Sedang Dikembangkan` : "Halaman Sedang Dikembangkan"} />

            <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center pt-20 pb-10">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-3xl mx-auto px-6 text-center z-10">
                    {/* Animated Icon Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="inline-flex items-center justify-center p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl mb-12 relative group"
                    >
                        <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Construction className="w-16 h-16 text-teal-600 dark:text-teal-400 relative z-10" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-3 -right-3 p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-neutral-700"
                        >
                            <Sparkles className="w-5 h-5 text-amber-500 dark:text-teal-200" />
                        </motion.div>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h1 className="text-3xl lg:text-6xl font-bold text-neutral-900 dark:text-white uppercase tracking-tight mb-4">
                            Halaman <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-600 dark:from-teal-400 dark:to-teal-900">Sedang Disiapkan</span>
                        </h1>

                        <div className="flex items-center justify-center gap-3 mb-8">
                            <span className="px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-black uppercase tracking-widest border border-teal-200 dark:border-teal-800">
                                {title || "Menu Item"}
                            </span>
                            <span className="text-neutral-300 dark:text-neutral-700 font-semibold">•</span>
                            <span className="text-neutral-400 dark:text-neutral-500 text-sm font-medium italic">
                                {path}
                            </span>
                        </div>

                        <p className="text-sm lg:text-lg text-neutral-600 dark:text-neutral-400 mb-10 max-w-xl mx-auto leading-relaxed">
                            Mohon maaf, halaman untuk menu ini masih dalam tahap pengembangan oleh tim teknis kami. Silakan kembali lagi nanti untuk melihat pembaruan data terbaru.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-row items-center justify-center gap-2">
                            <Button
                                onClick={() => window.history.back()}
                                variant="outline"
                                className="rounded-full px-3 py-2 h-auto text-xs lg:text-sm text-black dark:text-white font-semibold uppercase lg:tracking-widest group border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all hover:scale-105 active:scale-95"
                            >
                                <ArrowLeft className="w-4 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />

                            </Button>
                            <Button
                                className="rounded-full px-3 py-2 h-auto text-sm   lg:tracking-widest bg-teal-600 hover:bg-teal-700 text-white shadow-xs shadow-teal-500/20 transition-all hover:scale-105 active:scale-95"
                                onClick={() => window.location.href = '/dashboard'}
                            >
                                <Home className="w-4 h-3 " />
                                Home
                            </Button>
                        </div>
                    </motion.div>

                    {/* Progress indicator mockup */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-20 pt-10 border-t border-neutral-100 dark:border-neutral-900"
                    >
                        <div className="flex flex-wrap justify-center gap-8 opacity-40">
                            <div className="flex items-center gap-2">
                                <Timer className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-widest">Estimated: Q3 2026</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-widest">Public Access</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

DynamicMenuPage.layout = (page: React.ReactNode) => <FrontWrapper>{page}</FrontWrapper>;

export default DynamicMenuPage;

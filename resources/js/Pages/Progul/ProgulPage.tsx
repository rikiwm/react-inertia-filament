import React from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontWrapper from '@/Wrappers/FrontWrapper';
import { useProgulData } from '@/Hooks/useProgulData';
import { motion } from 'motion/react';
import {
    LayoutDashboard,
    Zap,
    ShieldCheck,
    Star,
    Heart,
    Smile,
    Lightbulb,
    TrendingUp,
    Users
} from 'lucide-react';
import { cn } from '@/Lib/Utils';

// Helper to assign icons/colors to categories
const getCategoryStyles = (id: number) => {
    const styles: Record<number, { icon: any; color: string; border: string; bg: string }> = {
        1: { icon: ShieldCheck, color: 'text-blue-600', border: 'border-blue-200', bg: 'bg-blue-50' },
        2: { icon: Zap, color: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50' },
        3: { icon: Star, color: 'text-yellow-600', border: 'border-yellow-200', bg: 'bg-yellow-50' },
        4: { icon: Heart, color: 'text-red-600', border: 'border-red-200', bg: 'bg-red-50' },
        5: { icon: Smile, color: 'text-pink-600', border: 'border-pink-200', bg: 'bg-pink-50' },
        6: { icon: Lightbulb, color: 'text-purple-600', border: 'border-purple-200', bg: 'bg-purple-50' },
        7: { icon: TrendingUp, color: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50' },
        8: { icon: Users, color: 'text-teal-600', border: 'border-teal-200', bg: 'bg-teal-50' },
        9: { icon: Zap, color: 'text-indigo-600', border: 'border-indigo-200', bg: 'bg-indigo-50' },
    };
    return styles[id] || { icon: LayoutDashboard, color: 'text-neutral-600', border: 'border-neutral-200', bg: 'bg-neutral-50' };
};

const ProgulPage = () => {
    const { categories, loading, error } = useProgulData();

    return (
        <FrontWrapper title="Program Unggulan">
            <Head title="Kinerja Progul - Program Unggulan Kota Padang" />

            <div className="min-h-screen bg-transparent pt-20 pb-20">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-2xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-2">
                                Program Unggulan <span className="text-teal-600">Kota Padang</span>
                            </h1>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
                                Pantau kinerja dan capaian program unggulan pemerintah Kota Padang untuk mewujudkan masyarakat yang lebih sejahtera dan mandiri.
                            </p>
                        </motion.div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="h-48 rounded-3xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="p-8 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-center">
                            <p className="text-red-600 dark:text-red-400 font-medium">Gagal memuat data Program Unggulan. Silakan coba lagi nanti.</p>
                        </div>
                    )}

                    {/* Cards Grid */}
                    {!loading && !error && (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1
                                    }
                                }
                            }}
                        >
                            {categories.map((category) => {
                                const styles = getCategoryStyles(category.id);
                                const Icon = styles.icon;

                                return (
                                    <motion.div
                                        key={category.id}
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            visible: { opacity: 1, y: 0 }
                                        }}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Link
                                            href={route('progul.detail', { id: category.id })}
                                            className={cn(
                                                "block group h-full relative p-4 rounded-2xl border transition-all duration-300",
                                                "bg-teal-50/50 dark:bg-teal-900",
                                                "border-teal-200 dark:border-teal-900",
                                                "hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/10"
                                            )}
                                        >
                                            {/* <div className={cn(
                                                "w-12 h-14 rounded-2xl flex items-center justify-center mb-2",
                                                styles.bg, "dark:bg-neutral-800"
                                            )}>
                                                <Icon className={cn("w-6 h-6", styles.color)} />
                                            </div> */}

                                            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 group-hover:text-teal-600 transition-colors">
                                                {category.name}
                                            </h3>

                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 font-medium">
                                                {category.count} Indikator Kinerja
                                            </p>

                                            <div className="flex items-center text-teal-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                                                Lihat Detail
                                                <Zap className="w-4 h-4 ml-2 fill-current" />
                                            </div>

                                            {/* Decorative Background Element */}
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Icon className="w-24 h-24" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </div>
            </div>
        </FrontWrapper>
    );
};

export default ProgulPage;

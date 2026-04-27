import React from 'react';
import { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontWrapper from '@/Wrappers/front-wrapper';
import { useProgulData } from '@/features/progul/hooks/use-progul-data';
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
    Users,

    Package,
} from 'lucide-react';
import { cn } from '@/Lib/utils';

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

interface ProgulPageProps {
    initialCategories?: any[];
    initialProgulData?: any[];
}

const ProgulPage = ({ initialCategories, initialProgulData }: ProgulPageProps) => {
    const { categories: hookCategories, loading: hookLoading, error: hookError } = useProgulData(initialProgulData);

    // Use initial data if provided by Inertia, otherwise use hook data
    const categories = initialCategories || hookCategories;
    const loading = !initialCategories && hookLoading;
    const error = !initialCategories && hookError;

    return (
        <>
            <Head title="Program Unggulan Kota Padang" />
            <div className="min-h-screen w-full bg-slate-50/50 dark:bg-transparent pt-4 pb-20">
                <div className="max-w-screen-2xl mx-auto px-4 lg:px-0 space-y-6">

                    {/* Header Section */}
                    <div className="flex  items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="lg:text-3xl md:text-2xl text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                Program Unggulan Kota Padang
                            </h1>
                            <p className="lg:text-sm md:text-xs text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                                Satujuan Untuk Kejayaan Kota Padang
                            </p>
                        </div>
                    </div>
                    <p className="lg:text-sm md:text-xs text-xs text-slate-500 dark:text-neutral-400">
                        Pantau kinerja dan capaian program unggulan pemerintah Kota Padang untuk mewujudkan masyarakat yang lebih sejahtera dan mandiri.
                    </p>
                    {/* <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                                <Package className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-[0.2em]">
                                Program Unggulan
                            </span>
                        </div>
                        <h1 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white uppercase">
                            Program Unggulan <span className="text-teal-600">Kota Padang</span>
                        </h1>
                        <p className="text-slate-500 dark:text-neutral-400 mt-2 max-w-2xl">
                            Pantau kinerja dan capaian program unggulan pemerintah Kota Padang untuk mewujudkan masyarakat yang lebih sejahtera dan mandiri.
                        </p>
                    </div> */}
                    {/* <div className="mb-10">
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
                    </div> */}

                    {/* Loading State */}
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="h-36 rounded-2xl bg-neutral-200/80 dark:bg-neutral-800 animate-pulse" />
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
                                            hidden: { opacity: 0, y: 10 },
                                            visible: { opacity: 1, y: 0 }
                                        }}
                                        whileHover={{ y: -1, scale: 1.02 }}
                                        transition={{ duration: 0.05 }}
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

                                            <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-teal-600 transition-colors">
                                                {category.name}
                                            </h3>

                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1 font-medium">
                                                {category.count} Indikator Kinerja
                                            </p>

                                            <div className="flex items-e text-teal-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                                                Lihat Detail
                                                <Zap className="w-4 h-4 ml-2 fill-current" />
                                            </div>

                                            {/* Decorative Background Element */}
                                            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Icon className="w-24 h-24" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Hashtag News Feed */}
                </div>
            </div>
        </>

    );
};
ProgulPage.layout = (page: ReactNode) => <FrontWrapper title="Program Unggulan Kota Padang">{page}</FrontWrapper>;


export default ProgulPage;

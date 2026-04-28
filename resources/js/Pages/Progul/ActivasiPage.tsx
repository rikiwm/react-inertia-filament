import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontWrapper from '@/Wrappers/front-wrapper';
import { useProgulData } from '@/features/progul/hooks/use-progul-data';
import { motion } from 'motion/react';
import { ReactNode } from 'react';
import {
    ChevronLeft,
    Activity,
    Target,
    BarChart3,
    ArrowRight,
    Package
} from 'lucide-react';
import { cn } from '@/Lib/utils';

interface Props {
    id: number;
<<<<<<< HEAD
    progulName?: string;
    hashtagNews?: any[];
    initialProgulData?: any[];
}

const ActivasiPage = ({ id, progulName, hashtagNews, initialProgulData }: Props) => {
    const [activeTab, setActiveTab] = useState('overview');
    const { getActivasiList, getProgulById, loading } = useProgulData(initialProgulData);
=======
}

const ActivasiPage = ({ id }: Props) => {
    const { getActivasiList, getProgulById, loading } = useProgulData();
>>>>>>> parent of ca842f5 (feat: implement news scraping service for programs and enhance responsive layout across dashboard pages)

    const progul = useMemo(() => getProgulById(id), [getProgulById, id]);
    const activasiList = useMemo(() => getActivasiList(id), [getActivasiList, id]);

    return (
        <>
            <Head title={`${progul?.name || 'Progul'} - Detail Activasi`} />
            <div className="min-h-screen w-full bg-slate-50/50 dark:bg-transparent pt-4 pb-20">
                <div className="max-w-screen-2xl mx-auto px-4 lg:px-0 space-y-6">

                    {/* Header Section */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                {progul?.name}
                            </h1>
                            <p className="text-neutral-500 dark:text-neutral-400 ms-2 font-medium">
                                <span className="text-teal-600 dark:text-teal-400 me-2">
                                    {activasiList.length}
                                </span>
                                Activasi
                            </p>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-neutral-400">
                        Pantau kinerja dan capaian program unggulan pemerintah Kota Padang untuk mewujudkan masyarakat yang lebih sejahtera dan mandiri.
                    </p>

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
                </div>
            </div>
        </>
    );
};
ActivasiPage.layout = (page: ReactNode) => <FrontWrapper title="Activasi Program Unggulan Kota Padang">{page}</FrontWrapper>;

export default ActivasiPage;

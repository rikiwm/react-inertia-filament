import React, { useEffect, useState } from 'react';
import { Package, TrendingUp, Presentation, Building2, CheckCircle2 } from 'lucide-react';
import { pbjSummaryService } from '@/Services/pbjSplitService';
import { motion, AnimatePresence } from 'motion/react';

const fmtRupiah = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

interface PbjSummaryBlocksProps {
    tahun: number;
    activeTab: 'CATALOG' | 'TENDER' | 'NON-TENDER';
}

export default function PbjSummaryBlocks({ tahun, activeTab }: PbjSummaryBlocksProps) {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        pbjSummaryService.fetchSummary(tahun).then(res => {
            if (isMounted) {
                setSummary(res);
                setLoading(false);
            }
        });

        return () => { isMounted = false; };
    }, [tahun]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-slate-100 dark:bg-neutral-900 animate-pulse rounded-2xl border border-slate-200 dark:border-neutral-800" />
                ))}
            </div>
        );
    }

    if (!summary) return null;
    console.log('sumary', summary.kategori);

    const dataTab = summary.kategori[activeTab] || { count: 0, nilai: 0 };

    // Label Dinamis Berdasarkan Tab
    let tabLabel = "E-Katalog";
    if (activeTab === 'TENDER') tabLabel = "Tender";
    if (activeTab === 'NON-TENDER') tabLabel = "Non-Tender";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: [0, 1], y: [20, 0] }}
            transition={{ duration: 0.1 }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Card 1: Total Nilai Transaksi */}
                <div className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-2xl border border-teal-200 hover:border-white dark:border-neutral-800 shadow-xs flex flex-col justify-between cursor-pointer hover:shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-xl">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Nilai {tabLabel}</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">{fmtRupiah(dataTab.nilai)}</h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Akumulasi Pagu / Kontrak {tahun}</p>
                    </div>
                </div>

                {/* Card 2: Jumlah Paket TRX */}
                <div className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-2xl border border-teal-200 hover:border-white dark:border-neutral-800 shadow-xs flex flex-col justify-between cursor-pointer hover:shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-lime-50 dark:bg-lime-900/30 text-lime-600 rounded-xl">
                            <Package className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Jumlah Paket</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">{dataTab.count}</h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Transaksi {tabLabel}</p>
                    </div>
                </div>

                {/* Card 3: Total Berdasarkan Status */}
                <div className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-2xl border border-teal-200 hover:border-white dark:border-neutral-800 shadow-xs flex flex-col justify-between cursor-pointer hover:shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-xl">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Status Pekerjaan</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">{dataTab.count} Paket</h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium border-t border-slate-100 dark:border-neutral-800 pt-2 text-emerald-600">Terverifikasi Selesai</p>
                    </div>
                </div>

                {/* Card 4: Kosong / Top Penyedia Global (Bisa disesuaikan, instruksi minta Card 4 Kosong!) */}
                <div className="bg-neutral-50/40 dark:bg-neutral-900 p-5 rounded-2xl border border-teal-200 hover:border-white dark:border-neutral-800 shadow-xs flex flex-col justify-between cursor-pointer hover:shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest text-center mt-2">Space Available</span>
                </div>
            </div>
        </motion.div>
    );
}

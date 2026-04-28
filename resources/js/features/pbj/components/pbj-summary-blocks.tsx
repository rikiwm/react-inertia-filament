import React, { useEffect, useState } from 'react';
import { Package, TrendingUp, Presentation, Building2, CheckCircle2, ShoppingCart, Layers, ShieldCheck, Wallet } from 'lucide-react';
import { pbjSummaryService } from '@/Services/pbj-split-service';
import { motion, AnimatePresence } from 'motion/react';

const fmtRupiah = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

const fmtInt = (v: number) =>
    new Intl.NumberFormat("id-ID").format(v);

interface PbjSummaryBlocksProps {
    tahun: number;
    activeTab: 'CATALOG' | 'TENDER' | 'NON-TENDER';
    initialData?: any;
}

export default function PbjSummaryBlocks({ tahun, activeTab, initialData }: PbjSummaryBlocksProps) {
    const [summary, setSummary] = useState<any>(initialData || null);
    const [loading, setLoading] = useState(!initialData);

    const isFirstRender = React.useRef(true);

    // Sync with initialData if it changes from Inertia props
    useEffect(() => {
        if (initialData) {
            setSummary(initialData);
            setLoading(false);
        }
    }, [initialData]);

    useEffect(() => {
        if (isFirstRender.current && initialData) {
            isFirstRender.current = false;
            return;
        }

        let isMounted = true;
        setLoading(true);
        pbjSummaryService.fetchSummary(tahun).then(res => {
            if (isMounted) {
                setSummary(res);
                setLoading(false);
            }
        }).catch(() => {
            if (isMounted) setLoading(false);
        });

        isFirstRender.current = false;
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
                {/* Card 1: Total Nilai / Pagu */}
                <div className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-2xl border border-teal-200 hover:border-white dark:border-neutral-800 shadow-xs flex flex-col justify-between cursor-pointer hover:shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-xl">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            {activeTab === 'CATALOG' ? 'Total Nilai' : 'Total Pagu'}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">{fmtRupiah(dataTab.nilai)}</h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium uppercase">Akumulasi {activeTab === 'CATALOG' ? 'Transaksi' : 'Pagu'} {tahun}</p>
                    </div>
                </div>

                {/* Card 2: Catalog (Total Produk) | Tender (HPS) */}
                <div className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-2xl border border-teal-200 hover:border-white dark:border-neutral-800 shadow-xs flex flex-col justify-between cursor-pointer hover:shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                            {activeTab === 'CATALOG' ? <ShoppingCart className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            {activeTab === 'CATALOG' ? 'Jumlah Produk' : 'Total HPS'}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                            {activeTab === 'CATALOG' ? `${fmtInt(dataTab.count_product || 0)} Item` : fmtRupiah(dataTab.hps || 0)}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium uppercase">
                            {activeTab === 'CATALOG' ? 'Produk Terpesan' : `Estimasi HPS ${tahun}`}
                        </p>
                    </div>
                </div>

                {/* Card 3: Catalog (Kuantitas) | Tender (Kontrak) */}
                <div className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-2xl border border-teal-200 hover:border-white dark:border-neutral-800 shadow-xs flex flex-col justify-between cursor-pointer hover:shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-lime-50 dark:bg-lime-900/30 text-lime-600 rounded-xl">
                            {activeTab === 'CATALOG' ? <Layers className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            {activeTab === 'CATALOG' ? 'Total Kuantitas' : 'Nilai Kontrak'}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                            {activeTab === 'CATALOG' ? fmtInt(dataTab.total_qty || 0) : fmtRupiah(dataTab.kontrak || 0)}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium uppercase">
                            {activeTab === 'CATALOG' ? 'Volume Transaksi' : 'Total Realisasi Kontrak'}
                        </p>
                    </div>
                </div>

                {/* Card 4: Status / Efisiensi */}
                <div className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-2xl border border-teal-200 hover:border-white dark:border-neutral-800 shadow-xs flex flex-col justify-between cursor-pointer hover:shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                            {activeTab === 'CATALOG' ? <Package className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            {activeTab === 'CATALOG' ? 'Total Paket' : 'Efisiensi'}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                            {activeTab === 'CATALOG' 
                                ? `${fmtInt(dataTab.count || 0)} Paket` 
                                : fmtRupiah(dataTab.efisiensi || 0)}
                        </h3>
                        <p className={`text-xs mt-1 font-medium uppercase ${activeTab === 'CATALOG' ? 'text-slate-500' : 'text-emerald-600'}`}>
                            {activeTab === 'CATALOG' ? 'Semua Status Transaksi' : 'Penghematan Anggaran'}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

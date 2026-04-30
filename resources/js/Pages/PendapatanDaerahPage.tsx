/**
 * @file Pages/PendapatanDaerahPage.tsx
 *
 * Halaman detail Pendapatan Daerah — breakdown per SKPD.
 *
 * Menampilkan:
 * - Header dengan summary (Target PAD, Realisasi PAD, Sisa, Persentase)
 * - Year selector dropdown (optional query param ?tahun=YYYY)
 * - Tabel SKPD breakdown dengan sortable columns
 * - Loading skeleton dan error handling
 * - Back button ke dashboard
 * - Responsive design (mobile/tablet/desktop)
 */

import { usePendapatanDaerahData, useRealisasiPendapatan } from "@/features/pendapatan-daerah/hooks";
import { SkpdTable } from "@/features/dashboard/components/skpd-table";
import { formatRupiahCompact, fmtNumber } from "@/Lib/formatters";
import FrontWrapper from "@/Wrappers/front-wrapper";
import { router } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { route } from "ziggy-js";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from 'motion/react';
import { BarChart3, Target, Info, TrendingUp, Wallet, Banknote, Activity } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { RealisasiPendapatanCategory } from "@/Services/pendapatan-daerah-service";
import { cn } from "@/Lib/utils";



// ─── Page Component ───────────────────────────────────────────────────────────

const PendapatanDaerahPage = ({ initialTahun, initialData, initialRealisasiDetail }: { initialTahun?: number, initialData?: any, initialRealisasiDetail?: any }) => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(initialTahun || currentYear);

    const [selectedCategory, setSelectedCategory] = useState<RealisasiPendapatanCategory | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (category: RealisasiPendapatanCategory | undefined | null) => {
        if (category) {
            setSelectedCategory(category);
            setIsModalOpen(true);
        } else {
            console.warn("No category data available to open modal");
        }
    };

    const { data, loading, error, setTahun } = usePendapatanDaerahData(selectedYear, initialData);
    const { data: realisasiDetail, loading: loadingDetail } = useRealisasiPendapatan(selectedYear, initialRealisasiDetail);

    const pajakDaerah = useMemo(() => realisasiDetail?.result?.find(r => r.code_rekening === "4.1.01"), [realisasiDetail]);
    const retribusiDaerah = useMemo(() => realisasiDetail?.result?.find(r => r.code_rekening === "4.1.02"), [realisasiDetail]);
    const kekayaanDaerah = useMemo(() => realisasiDetail?.result?.find(r => r.code_rekening === "4.1.03"), [realisasiDetail]);
    const lainLainPad = useMemo(() => realisasiDetail?.result?.find(r => r.code_rekening === "4.1.04"), [realisasiDetail]);

    const opsenPkb = useMemo(() => {
        return pajakDaerah?.item?.find(i => i.nama_rekening.includes("Opsen PKB"));
    }, [pajakDaerah]);

    const handleYearChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const year = parseInt(e.target.value);
            router.get(route("pendapatan-daerah"), { tahun: year }, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [],
    );

    const goBack = useCallback(() => {
        router.visit(route("dashboard"));
    }, []);

    const percentageColor = useMemo(() => {
        if (!data) return "text-neutral-600";
        const p = data.total_persentase_pad;
        if (p >= 75) return "text-teal-600";
        if (p >= 50) return "text-amber-600";
        return "text-red-600";
    }, [data?.total_persentase_pad]);

    const availableYears = useMemo(() => {
        const years = [];
        for (let i = currentYear; i >= currentYear - 4; i--) {
            years.push(i);
        }
        return years;
    }, [currentYear]);

    const percentageStatus = useMemo(() => {
        if (!data) return "";
        const p = data.total_persentase_pad;
        if (p >= 75) return "Sangat Baik";
        if (p >= 50) return "Cukup";
        return "Perlu Ditingkatkan";
    }, [data?.total_persentase_pad]);

    return (
        <div className="min-h-screen bg-transparent pt-2 pb-20">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />
            </div>
            <div className="mx-auto max-w-screen-2xl px-4 md:px-0">
                {/* ── Back Button ─────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 text-left"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">

                            <div className="w-12 h-10 lg:h-12 rounded-md lg:rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                                <BarChart3 className="w-6 h-5" />
                            </div>
                            <div>
                                <h1 className="text-lg md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                    Pendapatan Daerah
                                </h1>
                                <p className="text-xs md:text-md text-neutral-500 dark:text-neutral-400 font-medium">
                                    Breakdown pendapatan daerah per satuan kerja perangkat daerah
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* <label htmlFor="year-select" className="lg:text-sm md:text-xs text-xs text-neutral-700 dark:text-neutral-300">
                                Tahun Anggaran:
                            </label>
                            <select
                                 id="year-select"
                                 value={selectedYear}
                                 onChange={handleYearChange}
                                 className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                {availableYears.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select> */}
                            <button
                                onClick={() => router.visit(route("analitik"))}
                                className="flex items-center gap-2 px-2 py-2 bg-white dark:bg-neutral-900 border border-teal-200 dark:border-teal-800 rounded-lg text-xs font-bold text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all shadow-sm"
                            >
                                <Activity className="w-4 h-4" />
                                Analitik
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* ── Summary Cards ───────────────────────────────────────────── */}
                {!loading && data && (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Target PAD */}
                        <div className="rounded-lg lg:rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20 p-4 border border-teal-200 dark:border-teal-700">
                            <p className="text-sm font-medium text-teal-600 dark:text-teal-300 mb-2">Target PAD</p>
                            <p className="text-2xl font-semibold text-teal-900 dark:text-teal-100">
                                {formatRupiahCompact(data.total_pagu_pads)}
                            </p>
                        </div>

                        {/* Realisasi PAD */}
                        <div className="rounded-lg lg:rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20 p-4 border border-teal-200 dark:border-teal-700">
                            <p className="text-sm font-medium text-teal-600 dark:text-teal-300 mb-2">Realisasi PAD</p>
                            <p className="text-2xl font-semibold text-teal-900 dark:text-teal-100">
                                {formatRupiahCompact(data.total_realisasi_pad)}
                            </p>
                        </div>

                        {/* Sisa */}
                        <div className="rounded-lg lg:rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900/30 dark:to-neutral-800/20 p-4 border border-neutral-200 dark:border-neutral-700">
                            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-2">Sisa</p>
                            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                                {formatRupiahCompact(data.total_sisa_pad)}
                            </p>
                        </div>

                        {/* Persentase */}
                        <div className={`rounded-lg lg:rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900/30 dark:to-neutral-800/20 p-4 border border-neutral-200 dark:border-neutral-700`}>
                            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-2">Persentase</p>
                            <div>
                                <p className={`text-2xl font-semibold ${percentageColor}`}>
                                    {(data?.total_persentase_pad ?? 0).toFixed(1)}%
                                </p>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                    {percentageStatus}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Detailed Summary Cards ───────────────────────────────────── */}
                {!loadingDetail && realisasiDetail && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {/* Pajak Daerah */}
                        <div
                            onClick={() => openModal(pajakDaerah)}
                            className="bg-white dark:bg-neutral-900/50 p-5 rounded-2xl border border-teal-100 dark:border-teal-900 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-600/10 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                    <Target className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Pajak Daerah</h3>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Target</p>
                                    <p className="text-lg font-bold text-neutral-900 dark:text-white tabular-nums">
                                        {formatRupiahCompact(pajakDaerah?.total_anggaran || 0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-teal-600 font-bold">Realisasi ({pajakDaerah?.persen}%)</p>
                                    <p className="text-lg font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                                        {formatRupiahCompact(pajakDaerah?.total_realisasi || 0)}
                                    </p>
                                </div>

                            </div>
                            <div className="mt-4 flex justify-end">
                                <span className="text-[10px] font-bold text-teal-600 group-hover:underline flex items-center gap-1 uppercase tracking-wider">
                                    Lihat Detail <TrendingUp className="w-3 h-3" />
                                </span>
                            </div>
                        </div>

                        {/* Retribusi Daerah */}
                        <div
                            onClick={() => openModal(retribusiDaerah)}
                            className="bg-white dark:bg-neutral-900/50 p-5 rounded-2xl border border-teal-100 dark:border-teal-900 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-600/10 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                    <Target className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Retribusi Daerah</h3>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Target</p>
                                    <p className="text-lg font-bold text-neutral-900 dark:text-white tabular-nums">
                                        {formatRupiahCompact(retribusiDaerah?.total_anggaran || 0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-amber-600 font-bold">Realisasi ({retribusiDaerah?.persen}%)</p>
                                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                                        {formatRupiahCompact(retribusiDaerah?.total_realisasi || 0)}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <span className="text-[10px] font-bold text-amber-600 group-hover:underline flex items-center gap-1 uppercase tracking-wider">
                                    Lihat Detail <TrendingUp className="w-3 h-3" />
                                </span>
                            </div>
                        </div>

                        {/* Hasil Pengelolaan Kekayaan */}
                        <div
                            onClick={() => openModal(kekayaanDaerah)}
                            className="bg-white dark:bg-neutral-900/50 p-5 rounded-2xl border border-teal-100 dark:border-teal-900 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Target className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Hasil Pengelolaan Kekayaan</h3>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Target</p>
                                    <p className="text-lg font-bold text-neutral-900 dark:text-white tabular-nums">
                                        {formatRupiahCompact(kekayaanDaerah?.total_anggaran || 0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-blue-600 font-bold">Realisasi ({kekayaanDaerah?.persen}%)</p>
                                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                                        {formatRupiahCompact(kekayaanDaerah?.total_realisasi || 0)}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <span className="text-[10px] font-bold text-blue-600 group-hover:underline flex items-center gap-1 uppercase tracking-wider">
                                    Lihat Detail <TrendingUp className="w-3 h-3" />
                                </span>
                            </div>
                        </div>

                        {/* Lain-lain PAD yang Sah */}
                        <div
                            onClick={() => openModal(lainLainPad)}
                            className="bg-white dark:bg-neutral-900/50 p-5 rounded-2xl border border-teal-100 dark:border-teal-900 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-600/10 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <Target className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Lain-lain PAD Sah</h3>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Target</p>
                                    <p className="text-lg font-bold text-neutral-900 dark:text-white tabular-nums">
                                        {formatRupiahCompact(lainLainPad?.total_anggaran || 0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-purple-600 font-bold">Realisasi ({lainLainPad?.persen}%)</p>
                                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400 tabular-nums">
                                        {formatRupiahCompact(lainLainPad?.total_realisasi || 0)}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <span className="text-[10px] font-bold text-purple-600 group-hover:underline flex items-center gap-1 uppercase tracking-wider">
                                    Lihat Detail <TrendingUp className="w-3 h-3" />
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Detail Modal ────────────────────────────────────────────── */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto z-[9999] bg-white dark:bg-neutral-950 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                        <DialogHeader className="sticky top-0 bg-white dark:bg-neutral-950 z-10 pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-4">
                            <DialogTitle className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter">
                                Detail <span className="text-teal-600">{selectedCategory?.name || "Pendapatan"}</span>
                            </DialogTitle>
                            <DialogDescription>
                                Rincian target dan realisasi tahun {selectedYear}.
                            </DialogDescription>
                        </DialogHeader>

                        {selectedCategory ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Total Anggaran</p>
                                        <p className="text-xl font-black text-neutral-900 dark:text-white">
                                            {formatRupiahCompact(selectedCategory.total_anggaran || 0)}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900">
                                        <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">Total Realisasi</p>
                                        <p className="text-xl font-black text-teal-600 dark:text-teal-400">
                                            {formatRupiahCompact(selectedCategory.total_realisasi || 0)}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Capaian</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xl font-black text-neutral-900 dark:text-white">
                                                {selectedCategory.persen}%
                                            </p>
                                            <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-teal-500 rounded-full"
                                                    style={{ width: `${selectedCategory.persen}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest px-1">Daftar Rekening Pendapatan</h4>
                                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-100 dark:border-neutral-800 rounded-2xl overflow-hidden">
                                        {selectedCategory.item?.length > 0 ? (
                                            selectedCategory.item.map((item, idx) => (
                                                <div key={idx} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold mb-1">{item.kode_rekening}</p>
                                                            <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 leading-tight">
                                                                {item.nama_rekening}
                                                            </p>
                                                            <p className="text-[10px] text-neutral-500 mt-1 uppercase font-medium">{item.skpd}</p>
                                                        </div>
                                                        <div className="flex items-center gap-6 text-right">
                                                            <div className="hidden sm:block">
                                                                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">Anggaran</p>
                                                                <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400">{formatRupiahCompact(item.anggaran)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-tighter">Realisasi</p>
                                                                <p className="text-sm font-black text-neutral-900 dark:text-white">{formatRupiahCompact(item.realisasi)}</p>
                                                            </div>
                                                            <div className="min-w-[45px]">
                                                                <div className={cn(
                                                                    "text-[10px] font-black px-2 py-1 rounded-md text-center",
                                                                    (item.realisasi / item.anggaran * 100) >= 50 ? "bg-teal-500/10 text-teal-600" : "bg-amber-500/10 text-amber-600"
                                                                )}>
                                                                    {item.anggaran > 0 ? (item.realisasi / item.anggaran * 100).toFixed(1) : 0}%
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-neutral-500 text-sm">
                                                Tidak ada rincian data untuk kategori ini.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-12 text-center text-neutral-500">
                                Memuat data rincian...
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* ── Loading State Detailed ───────────────────────────────────── */}
                {loadingDetail && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-40 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                        ))}
                    </div>
                )}

                {/* ── Loading State ───────────────────────────────────────────── */}
                {!data && loading && (
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-lg h-32 bg-neutral-200 dark:bg-neutral-800 animate-pulse"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Error State ─────────────────────────────────────────────── */}
                {error && (
                    <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-4 mb-8">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                            Gagal memuat data pendapatan daerah. Silakan coba lagi atau hubungi administrator.
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                            Error: {error.message}
                        </p>
                    </div>
                )}

                {/* ── SKPD Table ──────────────────────────────────────────────── */}
                <div className="rounded-lg lg:rounded-2xl bg-neutral-50 dark:bg-zinc-900/30 border border-neutral-200 dark:border-teal-950 p-4 lg:p-6">
                    <h2 className="text-md font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                        {!loading && data && (
                            <>
                                Breakdown per SKPD (Satuan Kerja Perangkat Daerah)
                            </>
                        )}
                        {loading && (
                            <div className="flex flex-col gap-4">
                                {Array.from({ length: 14 }).map((_, i) => (
                                    <div key={i} className="animate-pulse mx-auto w-full h-8 bg-neutral-200 dark:bg-neutral-800 rounded" />
                                ))}
                            </div>
                        )}
                    </h2>

                    {!loading && data && <SkpdTable data={data.data} type="pendapatan" loading={loading} error={error} tahun={selectedYear} />}
                </div>

                {/* ── Footer Info ─────────────────────────────────────────────── */}
                <div className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-500">
                    <p>Data diperbarui secara berkala dari Dashboard Statistik Kota Padang</p>
                </div>
            </div>
        </div>
    );
};

PendapatanDaerahPage.layout = (page: ReactNode) => <FrontWrapper title="Pendapatan Daerah">{page}</FrontWrapper>;

export default PendapatanDaerahPage;

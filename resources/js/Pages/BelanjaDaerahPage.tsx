/**
 * @file Pages/BelanjaDaerahPage.tsx
 *
 * Halaman detail Belanja Daerah — breakdown per SKPD.
 *
 * Menampilkan:
 * - Header dengan summary (Pagu, Realisasi, Sisa, Persentase)
 * - Year selector dropdown (optional query param ?tahun=YYYY)
 * - Tabel SKPD breakdown dengan sortable columns
 * - Loading skeleton dan error handling
 * - Back button ke dashboard
 * - Responsive design (mobile/tablet/desktop)
 */

import { useBelanjaDaerahData } from "@/features/belanja-daerah/hooks/use-belanja-daerah-data";
import { SkpdTable } from "@/features/dashboard/components/skpd-table";
import { fmtNumber, formatRupiahCompact } from "@/Lib/formatters";
import FrontWrapper from "@/Wrappers/front-wrapper";
import { Head, router } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { route } from "ziggy-js";
import { ReactNode } from "react";
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, FileText, Target, Activity } from "lucide-react";



// ─── Page Component ───────────────────────────────────────────────────────────

const BelanjaDaerahPage = ({ initialTahun, initialData }: { initialTahun?: number, initialData?: BelanjaDaerahResponse }) => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(initialTahun || currentYear);

    const { data, loading, error, setTahun } = useBelanjaDaerahData(selectedYear, initialData);

    const handleYearChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const year = parseInt(e.target.value);
            router.get(route("belanja-daerah"), { tahun: year }, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [],
    );



    const percentageColor = useMemo(() => {
        if (!data) return "text-neutral-600";
        const p = data.total_persentase;
        if (p >= 75) return "text-teal-600";
        if (p >= 50) return "text-amber-600";
        return "text-red-600";
    }, [data?.total_persentase]);

    const availableYears = useMemo(() => {
        const years = [];
        for (let i = currentYear; i >= currentYear - 4; i--) {
            years.push(i);
        }
        return years;
    }, [currentYear]);

    const percentageStatus = useMemo(() => {
        if (!data) return "";
        const p = data.total_persentase;
        if (p >= 75) return "Sangat Baik";
        if (p >= 50) return "Cukup";
        return "Perlu Ditingkatkan";
    }, [data?.total_persentase]);
    // console.log("data", data);

    return (
        <>
            <Head title={`Detail Belanja Daerah`} />

            <div className="min-h-screen bg-transparent pt-2 pb-20">
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />
                </div>
                <div className="max-w-screen-2xl mx-auto px-4 md:px-0">
                    {/* ── Back Button ─────────────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 text-left"
                    >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">

                                <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="lg:text-3xl md:text-2xl text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                        Belanja Daerah
                                    </h1>
                                    <p className=" lg:text-sm md:text-xs text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                                        Breakdown belanja per satuan kerja perangkat daerah
                                    </p>
                                </div>
                            </div>

                            <div className="flex  md:flex-row items-center gap-3">
                                {/* <label htmlFor="year-select" className="text-xs md:text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Tahun Anggaran:
                                </label>
                                <select
                                    id="year-select"
                                    value={selectedYear}
                                    onChange={handleYearChange}
                                    className="px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    {availableYears.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select> */}
                                <button
                                    onClick={() => router.visit(route("analitik"))}
                                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-teal-200 dark:border-teal-800 rounded-lg text-xs font-bold text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all shadow-sm"
                                >
                                    <Activity className="w-4 h-4" />
                                    Analitik
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}


                    </motion.div>

                    {/* ── Summary Cards ───────────────────────────────────────────── */}
                    {!loading && data && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mb-4 text-left"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {/* Anggaran */}

                                <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                    <div className="flex items-center gap-3 text-teal-600 mb-2">
                                        <Target className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Total Anggaran</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                            {formatRupiahCompact(data.total_pagu)}
                                        </p>
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                            Rp. {fmtNumber(data.total_pagu)}
                                        </p>
                                    </div>
                                </div>

                                {/* Realisasi */}
                                <div className={`rounded-lg lg:rounded-xl bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-800/20 p-4 border border-teal-200 dark:border-teal-600`}>
                                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-2">Realisasi</p>
                                    <div>
                                        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                            {formatRupiahCompact(data.total_realisasi)}
                                        </p>
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                            {data.total_persentase.toFixed(1)}% dari anggaran
                                        </p>
                                    </div>
                                </div>


                                {/* Sisa */}
                                <div className={`rounded-lg lg:rounded-xl bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-800/20 p-4 border border-teal-200 dark:border-teal-600`}>
                                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-2">Sisa</p>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                        {formatRupiahCompact(data.total_sisa)}
                                    </p>
                                </div>

                                {/* Persentase */}
                                <div className={`rounded-lg lg:rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900/30 dark:to-neutral-800/20 p-4 border border-neutral-200 dark:border-neutral-600`}>
                                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-2">Persentase</p>
                                    <div>
                                        <p className={`text-2xl font-bold ${percentageColor}`}>
                                            {data.total_persentase.toFixed(1)}%
                                        </p>
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                            {percentageStatus}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Loading State ───────────────────────────────────────────── */}
                    {loading && (
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
                                Gagal memuat data belanja daerah. Silakan coba lagi atau hubungi administrator.
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                Error: {error.message}
                            </p>
                        </div>
                    )}

                    {/* ── SKPD Table ──────────────────────────────────────────────── */}
                    <div className="rounded-lg lg:rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 lg:p-6">
                        <h2 className="text-md lg:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                            {loading ? (
                                <div className="flex flex-col gap-4">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="animate-pulse mx-auto w-full h-8 bg-neutral-200 dark:bg-neutral-800 rounded" />
                                    ))}
                                </div>
                            ) : data && (
                                <>Breakdown per SKPD (Satuan Kerja Perangkat Daerah)</>
                            )}
                        </h2>

                        {!loading && data && <SkpdTable data={data.data} type="belanja" loading={loading} error={error} tahun={selectedYear} />}
                    </div>

                    {/* ── Footer Info ─────────────────────────────────────────────── */}
                    <div className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-500">
                        <p>Data diperbarui secara berkala dari Dashboard Statistik Kota Padang</p>
                    </div>
                </div>
            </div>
        </>
    );
};


BelanjaDaerahPage.layout = (page: ReactNode) => <FrontWrapper title={undefined}>{page}</FrontWrapper>;

export default BelanjaDaerahPage;

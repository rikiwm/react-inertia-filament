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

import { usePendapatanDaerahData } from "@/Hooks/usePendapatanDaerahData";
import { SkpdTable } from "@/Components/Dashboard/SkpdTable";
import { formatRupiahCompact } from "@/Services/pendapatanDaerahService";
import FrontWrapper from "@/Wrappers/FrontWrapper";
import { router } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { route } from "ziggy-js";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";


// ─── Page Component ───────────────────────────────────────────────────────────

const PendapatanDaerahPage = () => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // Get tahun from URL query param if available
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tahun = params.get("tahun");
        if (tahun) {
            setSelectedYear(parseInt(tahun));
        }
    }, []);

    const { data, loading, error, setTahun } = usePendapatanDaerahData(selectedYear);

    const handleYearChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const year = parseInt(e.target.value);
            setSelectedYear(year);
            // Update URL without navigating
            const newUrl = `${route("pendapatan-daerah")}?tahun=${year}`;
            window.history.replaceState({}, "", newUrl);

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
        <div className="min-h-screen bg-transparent pt-18 pb-20">
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-8">
                {/* ── Back Button ─────────────────────────────────────────────── */}
                <button
                    onClick={goBack}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-teal-100 dark:hover:bg-neutral-900 rounded-lg transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-3" />Kembali
                </button>

                {/* ── Header ──────────────────────────────────────────────────── */}
                <div className="mb-4">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h1 className="lg:text-4xl font-bold uppercase text-neutral-900 dark:text-neutral-100 mb-2">
                                Pendapatan Daerah {selectedYear}
                            </h1>
                            <p className="text-neutral-600 xs:text-xs dark:text-neutral-400 capitalize">
                                Breakdown pendapatan asli daerah per satuan kerja perangkat daerah
                            </p>
                        </div>

                        {/* ── Year Selector ───────────────────────────────────── */}
                        <div className="flex items-center gap-3">
                            <label htmlFor="year-select" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Tahun:
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
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Summary Cards ───────────────────────────────────────────── */}
                {!loading && data && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Target PAD */}
                        <div className="rounded-lg lg:rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20 p-4 border border-teal-200 dark:border-teal-700">
                            <p className="text-sm font-medium text-teal-600 dark:text-teal-300 mb-2">Target PAD</p>
                            <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
                                {formatRupiahCompact(data.total_pagu_pads)}
                            </p>
                        </div>

                        {/* Realisasi PAD */}
                        <div className="rounded-lg lg:rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20 p-4 border border-teal-200 dark:border-teal-700">
                            <p className="text-sm font-medium text-teal-600 dark:text-teal-300 mb-2">Realisasi PAD</p>
                            <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
                                {formatRupiahCompact(data.total_realisasi_pad)}
                            </p>
                        </div>

                        {/* Sisa */}
                        <div className="rounded-lg lg:rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900/30 dark:to-neutral-800/20 p-4 border border-neutral-200 dark:border-neutral-700">
                            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-2">Sisa</p>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {formatRupiahCompact(data.total_sisa_pad)}
                            </p>
                        </div>

                        {/* Persentase */}
                        <div className={`rounded-lg lg:rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900/30 dark:to-neutral-800/20 p-4 border border-neutral-200 dark:border-neutral-700`}>
                            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-2">Persentase</p>
                            <div>
                                <p className={`text-2xl font-bold ${percentageColor}`}>
                                    {data.total_persentase_pad.toFixed(1)}%
                                </p>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                    {percentageStatus}
                                </p>
                            </div>
                        </div>
                    </div>
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
                            Gagal memuat data pendapatan daerah. Silakan coba lagi atau hubungi administrator.
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                            Error: {error.message}
                        </p>
                    </div>
                )}

                {/* ── SKPD Table ──────────────────────────────────────────────── */}
                <div className="rounded-lg lg:rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-teal-800 p-6">
                    <h2 className="text-md font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                        Breakdown per SKPD (Satuan Kerja Perangkat Daerah)
                    </h2>

                    {data && <SkpdTable data={data.data} type="pendapatan" loading={loading} error={error} />}
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

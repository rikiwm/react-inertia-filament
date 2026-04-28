/**
 * @file Pages/AnalyticsPage.tsx
 *
 * Halaman Analitik dan Komparasi Data Anggaran per Tahun.
 * Menampilkan visualisasi data APBD (Pendapatan & Belanja) dalam rentang waktu tertentu.
 */

import { useState, useMemo } from "react";
import FrontWrapper from "@/Wrappers/front-wrapper";
import { motion, AnimatePresence } from "motion/react";
import {
    BarChart3,
    TrendingUp,
    ArrowLeft,
    Calendar,
    TrendingDown,
    Activity,
    Target,
    Wallet,
    Info,
    ChevronRight,
    Download
} from "lucide-react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { formatRupiahCompact, fmtNumber } from "@/Lib/formatters";
import { useComparisonData, ComparisonDataPoint } from "@/features/dashboard/hooks/use-comparison-data";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    Cell,
    AreaChart,
    Area
} from "recharts";
import { cn } from "@/Lib/utils";

// ─── Sub-Components ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-neutral-900 border border-teal-100 dark:border-neutral-800 p-4 rounded-xl shadow-xl backdrop-blur-md bg-opacity-90">
                <p className="text-sm font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" /> Tahun {label}
                </p>
                <div className="space-y-1.5">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-8">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">{entry.name}</span>
                            </div>
                            <span className="text-xs font-bold text-neutral-900 dark:text-white">
                                {formatRupiahCompact(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

// ─── Page Component ───────────────────────────────────────────────────────────

const AnalyticsPage = ({ initialData }: { initialData?: ComparisonDataPoint[] }) => {
    const currentYear = new Date().getFullYear();
    const availableYears = useMemo(() => {
        const years = [];
        for (let i = currentYear; i >= 2021; i--) {
            years.push(i);
        }
        return years;
    }, [currentYear]);

    const { data, loading, error } = useComparisonData(availableYears, initialData);
    const [activeTab, setActiveTab] = useState<"pendapatan" | "belanja">("pendapatan");

    const stats = useMemo(() => {
        if (!data || data.length < 2) return null;
        const latest = data[data.length - 1];
        const previous = data[data.length - 2];

        const pendapatanGrowth = ((latest.pendapatan_realisasi - previous.pendapatan_realisasi) / previous.pendapatan_realisasi) * 100;
        const belanjaGrowth = ((latest.belanja_realisasi - previous.belanja_realisasi) / previous.belanja_realisasi) * 100;

        return {
            latest,
            pendapatanGrowth,
            belanjaGrowth
        };
    }, [data]);

    const goBack = () => {
        router.visit(route("dashboard"));
    };

    const handleExport = () => {
        if (!data || data.length === 0) return;

        // Prepare headers and data for CSV
        const headers = ["Tahun", "Target Pendapatan", "Realisasi Pendapatan", "Capaian Pendapatan (%)", "Anggaran Belanja", "Realisasi Belanja", "Capaian Belanja (%)"];

        const csvRows = [
            headers.join(","),
            ...data.map(item => [
                item.tahun,
                item.pendapatan_target,
                item.pendapatan_realisasi,
                item.pendapatan_persen,
                item.belanja_anggaran,
                item.belanja_realisasi,
                item.belanja_persen
            ].join(","))
        ];

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `analitik-apbd-padang-${new Date().getFullYear()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-transparent pt-2 pb-20">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="mx-auto max-w-screen-2xl px-4 md:px-0">
                {/* ── Header ──────────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-4">
                        <button
                            onClick={goBack}
                            className="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border border-teal-100 dark:border-neutral-800 flex items-center justify-center text-neutral-600 hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight flex items-center gap-3">
                                <Activity className="w-8 h-8 text-teal-600" />
                                Analitik & Komparasi
                            </h1>
                            <p className="text-xs md:text-md text-neutral-500 dark:text-neutral-400 font-medium">
                                Visualisasi tren anggaran dan realisasi lintas tahun (2021 - {currentYear})
                            </p>
                        </div>
                    </div>

                    <div className="flex bg-white dark:bg-neutral-900 p-1 rounded-xl border border-teal-100 dark:border-neutral-800 shadow-sm">
                        <button
                            onClick={() => setActiveTab("pendapatan")}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                                activeTab === "pendapatan"
                                    ? "bg-teal-600 text-white shadow-lg shadow-teal-500/20"
                                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            )}
                        >
                            Pendapatan
                        </button>
                        <button
                            onClick={() => setActiveTab("belanja")}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                                activeTab === "belanja"
                                    ? "bg-teal-600 text-white shadow-lg shadow-teal-500/20"
                                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            )}
                        >
                            Belanja
                        </button>
                    </div>
                </motion.div>

                {/* ── Summary Stats ───────────────────────────────────────────── */}
                {!loading && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-teal-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-lime-600">
                                    <Target className="w-5 h-5" />
                                </div>
                                <span className={cn(
                                    "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                                    activeTab === "pendapatan"
                                        ? stats.pendapatanGrowth >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                        : stats.belanjaGrowth >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                )}>
                                    {activeTab === "pendapatan"
                                        ? (stats.pendapatanGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)
                                        : (stats.belanjaGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)
                                    }
                                    {activeTab === "pendapatan" ? stats.pendapatanGrowth.toFixed(1) : stats.belanjaGrowth.toFixed(1)}%
                                </span>
                            </div>
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                                Realisasi {activeTab === "pendapatan" ? "Pendapatan" : "Belanja"} {currentYear}
                            </p>
                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {formatRupiahCompact(activeTab === "pendapatan" ? stats.latest.pendapatan_realisasi : stats.latest.belanja_realisasi)}
                            </h3>
                            <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest font-bold">vs Tahun Sebelumnya</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-teal-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-lime-600">
                                    <Wallet className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                                Total {activeTab === "pendapatan" ? "Target" : "Anggaran"} {currentYear}
                            </p>
                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {formatRupiahCompact(activeTab === "pendapatan" ? stats.latest.pendapatan_target : stats.latest.belanja_anggaran)}
                            </h3>
                            <div className="mt-3 w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-teal-500 transition-all duration-1000"
                                    style={{ width: `${activeTab === "pendapatan" ? stats.latest.pendapatan_persen : stats.latest.belanja_persen}%` }}
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-teal-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-lime-900/30 flex items-center justify-center text-lime-600">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                                Persentase Realisasi
                            </p>
                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {activeTab === "pendapatan" ? stats.latest.pendapatan_persen : stats.latest.belanja_persen}%
                            </h3>
                            <p className="text-xs text-neutral-500 mt-1">
                                Capaian efektivitas tahun anggaran berjalan
                            </p>
                        </motion.div>
                    </div>
                )}

                {/* ── Main Charts ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Primary Bar Chart */}
                    <AnimatePresence>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-2 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-teal-100 dark:border-neutral-800 shadow-sm overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                        Tren Komparasi {activeTab === "pendapatan" ? "Pendapatan" : "Belanja"}
                                    </h3>
                                    <p className="text-xs text-neutral-500">Anggaran vs Realisasi (Rp)</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-sm bg-teal-500" />
                                        <span className="text-[10px] font-bold text-neutral-500 uppercase">Realisasi</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-sm bg-neutral-200 dark:bg-neutral-700" />
                                        <span className="text-[10px] font-bold text-neutral-500 uppercase">{activeTab === "pendapatan" ? "Target" : "Anggaran"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[350px] w-full">
                                {loading ? (
                                    <div className="w-full h-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl animate-pulse">
                                        <BarChart3 className="w-10 h-10 text-neutral-300 animate-bounce" />
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={data}
                                            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                                            barGap={8}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" className="dark:stroke-neutral-800" />
                                            <XAxis
                                                dataKey="tahun"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12, fontWeight: 600, fill: '#888' }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#888' }}
                                                tickFormatter={(val) => formatRupiahCompact(val)}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                            <Bar
                                                name={activeTab === "pendapatan" ? "Target" : "Anggaran"}
                                                dataKey={activeTab === "pendapatan" ? "pendapatan_target" : "belanja_anggaran"}
                                                fill="#e5e7eb"
                                                radius={[6, 6, 0, 0]}
                                                className="dark:fill-neutral-800"
                                            />
                                            <Bar
                                                name="Realisasi"
                                                dataKey={activeTab === "pendapatan" ? "pendapatan_realisasi" : "belanja_realisasi"}
                                                fill="#0d9488"
                                                radius={[6, 6, 0, 0]}
                                            >
                                                {data.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === data.length - 1 ? "#0d9488" : "#0d9488cc"} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Secondary Area Chart - Percentages */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-teal-100 dark:border-neutral-800 shadow-sm"
                    >
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Tren Efisiensi</h3>
                            <p className="text-xs text-neutral-500">Persentase Capaian per Tahun</p>
                        </div>

                        <div className="h-[250px] w-full mb-6">
                            {loading ? (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl animate-pulse">
                                    <TrendingUp className="w-10 h-10 text-neutral-300" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={data}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorPersen" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="tahun" hide />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} domain={[0, 100]} />
                                        <Tooltip
                                            content={({ active, payload }: any) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white dark:bg-neutral-900 border border-teal-100 dark:border-neutral-800 px-3 py-2 rounded-lg shadow-lg">
                                                            <p className="text-xs font-bold text-neutral-900 dark:text-white">
                                                                {payload[0].value.toFixed(2)}%
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey={activeTab === "pendapatan" ? "pendapatan_persen" : "belanja_persen"}
                                            stroke="#0d9488"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorPersen)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <Info className="w-4 h-4 text-teal-600" />
                                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Insight</span>
                                </div>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    {stats && (
                                        activeTab === "pendapatan"
                                            ? `Realisasi pendapatan tahun ${currentYear} menunjukkan tren ${stats.pendapatanGrowth >= 0 ? 'positif' : 'penurunan'} sebesar ${Math.abs(stats.pendapatanGrowth).toFixed(1)}% dibandingkan tahun sebelumnya.`
                                            : `Penyerapan belanja tahun ${currentYear} ${stats.belanjaGrowth >= 0 ? 'meningkat' : 'menurun'} ${Math.abs(stats.belanjaGrowth).toFixed(1)}% dari periode yang sama di tahun lalu.`
                                    )}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ── Data Table ──────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-neutral-900 rounded-3xl border border-teal-100 dark:border-neutral-800 shadow-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Rincian Data Tahunan</h3>
                        <button
                            onClick={handleExport}
                            disabled={loading || !data}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4" /> Export Data
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Tahun</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Target/Anggaran</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Realisasi</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Persentase</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-4"><div className="h-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-full" /></td>
                                        </tr>
                                    ))
                                ) : (
                                    data.slice().reverse().map((row, idx) => (
                                        <tr key={idx} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                            <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white">{row.tahun}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                                {formatRupiahCompact(activeTab === "pendapatan" ? row.pendapatan_target : row.belanja_anggaran)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-teal-600">
                                                {formatRupiahCompact(activeTab === "pendapatan" ? row.pendapatan_realisasi : row.belanja_realisasi)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                                        {activeTab === "pendapatan" ? row.pendapatan_persen : row.belanja_persen}%
                                                    </span>
                                                    <div className="w-12 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden hidden sm:block">
                                                        <div
                                                            className="h-full bg-teal-500 rounded-full"
                                                            style={{ width: `${activeTab === "pendapatan" ? row.pendapatan_persen : row.belanja_persen}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => router.visit(`${route(activeTab === "pendapatan" ? "pendapatan-daerah" : "belanja-daerah")}?tahun=${row.tahun}`)}
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline"
                                                >
                                                    Detail <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* ── Footer ──────────────────────────────────────────────────── */}
                <div className="mt-12 text-center">
                    <p className="text-xs text-neutral-500 font-medium">
                        Data dikumpulkan dari API Dashboard Statistik Kota Padang. Diperbarui secara berkala.
                    </p>
                </div>
            </div>
        </div>
    );
};

AnalyticsPage.layout = (page: React.ReactNode) => (
    <FrontWrapper title="Analitik & Komparasi Data">
        {page}
    </FrontWrapper>
);

export default AnalyticsPage;

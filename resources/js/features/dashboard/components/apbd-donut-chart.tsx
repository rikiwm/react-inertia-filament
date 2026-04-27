/**
 * @file features/dashboard/components/apbd-donut-chart.tsx
 *
 * APBD Donut Chart components for visualizing Belanja & Pendapatan Daerah.
 * Extracted from DashboardPage.tsx.
 *
 * Includes:
 * - ApbdDonutSkeleton: Loading placeholder
 * - ApbdDonutChart: Individual donut chart
 * - ApbdDonutPanel: Wrapper panel with data fetching
 */

import { memo, useEffect, useMemo, useRef } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/Lib/utils";
import { fmtRupiah } from "@/Lib/formatters";
import { useApbdData } from "@/features/dashboard/hooks/use-apbd-data";
import type { ApbdItemNormalized } from "@/Types/apbd";
import { APBD_COLORS } from "../constants";
import { DonutTooltip } from "./chart-tooltips";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";

// ─── Donut Skeleton ──────────────────────────────────────────────────────────

/**
 * Skeleton loading untuk satu donut chart APBD.
 */
export const ApbdDonutSkeleton = memo(function ApbdDonutSkeleton() {
    return (
        <div className="flex flex-col items-center animate-pulse">
            <div className="w-[160px] h-[160px] rounded-full border-[24px] border-neutral-200 dark:border-neutral-800" />
            <div className="mt-4 space-y-2 w-full">
                <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 w-3/4 mx-auto" />
                <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 w-1/2 mx-auto" />
            </div>
        </div>
    );
});

// ─── Donut Chart ─────────────────────────────────────────────────────────────

interface ApbdDonutChartProps {
    /** Data item APBD yang sudah dinormalisasi (Belanja atau Pendapatan). */
    item: ApbdItemNormalized;
    /** Judul kartu donut. */
    title: string;
    /** Optional click handler untuk navigasi ke detail page. */
    onClick?: () => void;
}

/**
 * Menampilkan satu donut chart untuk item APBD (Belanja atau Pendapatan Daerah).
 *
 * Donut chart dibagi dua segmen:
 * - Segmen teal: persentase realisasi
 * - Segmen abu (neutral): persentase sisa
 *
 * Di tengah donut ditampilkan persentase realisasi sebagai angka besar.
 */
export const ApbdDonutChart = memo(function ApbdDonutChart({
    item,
    title,
    onClick,
}: ApbdDonutChartProps) {
    /** Data untuk PieChart: 2 segmen (realisasi + sisa). */
    const pieData = useMemo(
        () => [
            { name: "Realisasi / Capaian", value: item.persenRealisasi, rupiah: item.realisasi },
            { name: "Sisa / Belum Terealisasi", value: item.persenSisa, rupiah: item.sisa },
        ],
        [item.persenRealisasi, item.persenSisa, item.realisasi, item.sisa],
    );

    const isHealthy = item.persenRealisasi >= 50;

    /** Track if chart already animated once to avoid re-animating on every render */
    const hasAnimated = useRef(false);
    const shouldAnimate = !hasAnimated.current;
    useEffect(() => {
        hasAnimated.current = true;
    }, []);

    return (
        <button
            onClick={onClick}
            disabled={!onClick}
            className={cn(
                "flex flex-col h-full  rounded-lg lg:rounded-2xl bg-neutral-50 dark:bg-neutral-900 p-3 lg:p-6 text-left",
                onClick &&
                "cursor-pointer hover:shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all transition-shadow duration-300",
                !onClick && "cursor-default",
            )}
            type="button"
        >
            {/* Judul */}
            <div className="mb-3">
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{title}</p>
                <p className="text-xs text-teal-700 dark:text-teal-400 mt-0.5">
                    {title == "Belanja Daerah"
                        ? `Pagu Anggaran: ${fmtRupiah(item.anggaran)}`
                        : `Target Penerimaan: ${fmtRupiah(item.anggaran)}`}
                </p>
            </div>

            {/* Donut Chart dengan label tengah */}
            <div className="relative flex items-center justify-center max-w-full px-2">
                <ResponsiveContainer width={190} height={190}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            innerRadius={60}
                            outerRadius={95}
                            paddingAngle={2}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            strokeWidth={0}
                            isAnimationActive={shouldAnimate}
                            animationDuration={600}
                            animationEasing="ease-out"
                        >
                            <Cell fill={APBD_COLORS.realisasi.fill} />
                            <Cell fill={APBD_COLORS.sisa.fill} className="dark:fill-neutral-700" />
                        </Pie>
                        <Tooltip content={<DonutTooltip />} cursor={{ fill: "transparent" }} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Label persentase di tengah donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p
                        className={cn(
                            "text-2xl font-bold tabular-nums leading-none",
                            isHealthy
                                ? "text-teal-600 dark:text-teal-400"
                                : "text-teal-900 dark:text-teal-900",
                        )}
                    >
                        {item.persenRealisasi.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-teal-500 mt-0.5 font-medium">Persentase</p>
                </div>
            </div>

            {/* Legenda + nilai rupiah */}
            <div className="space-y-2 mt-2">
                {[
                    {
                        key: "realisasi" as const,
                        label: title == "Belanja Daerah" ? "Realisasi Pagu" : "Capaian",
                        value: item.realisasi,
                        pct: item.persenRealisasi,
                    },
                    {
                        key: "sisa" as const,
                        label: title == "Belanja Daerah" ? "Sisa Pagu" : "Sisa Target",
                        value: item.sisa,
                        pct: item.persenSisa,
                    },
                ].map((row) => (
                    <div key={row.key} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span
                                className={cn(
                                    "w-2.5 h-2.5 rounded-full flex-shrink-0",
                                    APBD_COLORS[row.key].bg,
                                )}
                            />
                            <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                                {row.label}
                            </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
                                {fmtRupiah(row.value)}
                            </span>
                            <span className="text-[10px] text-teal-700 ml-1 tabular-nums">
                                ({row.pct.toFixed(1)}%)
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress bar sebagai visual pembanding */}
            <div className="mt-3">
                <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-teal-500 transition-[width] duration-500 ease-out"
                        style={{ width: `${Math.min(100, item.persenRealisasi)}%` }}
                    />
                </div>
            </div>
        </button>
    );
});

// ─── APBD Donut Panel ────────────────────────────────────────────────────────

/**
 * Wrapper panel untuk 2 donut chart APBD — menangani loading, error, dan rendering.
 */
export const ApbdDonutPanel = memo(function ApbdDonutPanel({
    tahun,
    initialData = null,
}: {
    tahun: number;
    initialData?: any; // Menggunakan any sementara karena import type mungkin ribet, tapi sebaiknya ApbdSummary
}) {
    const { data, isLoading, error, retry } = useApbdData(tahun, initialData);

    return (
        <div className="lg:col-span-1 bg-white dark:bg-neutral-950 rounded-2xl border border-teal-200 dark:border-teal-900 p-2 lg:p-4">
            {/* Header panel */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                        Anggaran Pendapatan & Belanja Daerah{" "}
                        <b className="text-teal-800 dark:text-teal-400">{tahun}</b>
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        Anggaran, Realisasi, Target &amp; Selisih
                    </p>
                </div>
                {isLoading && (
                    <svg
                        className="w-4 h-4 text-teal-500 animate-spin flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3a9 9 0 1 0 9 9"
                        />
                    </svg>
                )}
            </div>

            {/* Error state */}
            {error && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <svg
                        className="w-8 h-8 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                    <button
                        onClick={retry}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            )}

            {/* Loading state */}
            {isLoading && !data && (
                <div className="grid grid-cols-2 mt-4 gap-6 py-6">
                    <ApbdDonutSkeleton />
                    <ApbdDonutSkeleton />
                </div>
            )}

            {/* Success — 2 donut chart berdampingan */}
            {data && (
                <>
                    <div className="grid grid-cols-2 gap-1.5 md:gap-3 py-2">
                        <ApbdDonutChart
                            item={data.belanjaDaerah}
                            title="Belanja Daerah"
                            onClick={() =>
                                router.visit(`${route("belanja-daerah")}?tahun=${tahun}`)
                            }
                        />
                        <ApbdDonutChart
                            item={data.pendapatanDaerah}
                            title="Pendapatan Daerah"
                            onClick={() =>
                                router.visit(`${route("pendapatan-daerah")}?tahun=${tahun}`)
                            }
                        />
                    </div>

                    {/* Sumber data */}
                    <div className="flex flex-col dark:bg-neutral-900 dark:border-neutral-800 justify-between  lg:flex-row items-start gap-3 p-2 border rounded-md bg-teal-50">
                        <div className="bg-white dark:bg-teal-950/40 dark:border-teal-900/20 border p-4 rounded-md w-full">
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                {fmtRupiah(data.belanjaDaerah.realisasi)}
                            </h2>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                {" "}
                                REALISASI BElANJA DAERAH
                            </p>
                        </div>
                        <div className="bg-white dark:bg-teal-950/40 dark:border-teal-900/20 border p-4 rounded-md w-full">
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                {fmtRupiah(data.pendapatanDaerah.realisasi)}
                            </h2>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                {" "}
                                CAPAIAN PENDAPATAN DAERAH
                            </p>
                        </div>
                    </div>
                    <p className="text-[10px] text-neutral-300 dark:text-neutral-700 mt-4 text-right">
                        Sumber: dashboard.padang.go.id · {data.tahun}
                    </p>
                </>
            )}
        </div>
    );
});

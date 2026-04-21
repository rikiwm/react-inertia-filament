/**
 * @file Pages/DashboardPage.tsx
 *
 * Halaman dashboard statistik publik — KPI Cards data PBJ + Donut Chart data APBD
 * dari API resmi Dashboard Kota Padang.
 *
 * Fitur:
 * - KPI Cards PBJ real-time (Pagu, Paket, Berlangsung, Selesai)
 * - 2 Donut Chart APBD: Belanja Daerah & Pendapatan Daerah (% Realisasi & Sisa)
 * - Filter tahun anggaran (sinkron antara PBJ dan APBD)
 * - Loading skeleton & error state
 * - Area chart + Bar chart volume + Tabel transaksi demo
 * - Ticker harga simulasi & dark mode penuh
 */

import { Table } from "@/Components/UI/Table";
import { getChartData, RECENT_TRANSACTIONS, TIME_RANGES, type TimeRange } from "@/Constants/dashboard";
import { useApbdData } from "@/Hooks/useApbdData";
import { usePbjData } from "@/Hooks/usePbjData";
import { cn } from "@/Lib/Utils";
import FrontWrapper from "@/Wrappers/FrontWrapper";
import { PendapatanSkpdPanel, PendapatanSkpdTable } from "@/Components/Dashboard/PendapatanSkpdPanel";
import { usePendapatanSkpd } from "@/Hooks/usePendapatanSkpd";
import type { PendapatanSkpdNormalized } from "@/Types/PendapatanSkpd";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { memo, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import type { ApbdItemNormalized } from "@/Types/Apbd";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";

// ─── Formatter Helpers ────────────────────────────────────────────────────────

/** Format angka ke format compact Rupiah (43,5 M, 1,2 T, dsb.). */
const fmtRupiah = (v: number) =>
    new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1, style: "currency", currency: "IDR" }).format(v);

/** Format angka ke Rupiah penuh tanpa compact — digunakan di tooltip donut chart. */
const fmtRupiahFull = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

/** Format angka ke format compact tanpa satuan (43,5 rb, 1,2 jt). */
const fmtCompact = (v: number) =>
    new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(v);

/** Format angka ke format mata uang USD (untuk chart demo). */
const fmtUSD = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);


// ─── Ticker (SKPD Pendapatan) ────────────────────────────────────────────────

/**
 * Baris ticker pendapatan SKPD yang bergerak horizontal (marquee).
 * Menampilkan label SKPD, persentase realisasi, dan sisa anggaran.
 */
const PriceTicker = memo(function PriceTicker({ data }: { data: PendapatanSkpdNormalized[] | null }) {
    if (!data || data.length === 0) {
        return (
            <div className="overflow-hidden w-full border-b border-teal-300 dark:border-teal-800 bg-transparent dark:bg-neutral-950">
                <div className="flex whitespace-nowrap py-2 px-6">
                    <span className="text-xs text-neutral-400 animate-pulse">Memuat data pendapatan SKPD...</span>
                </div>
            </div>
        );
    }

    const items = [...data, ...data]; // duplikasi untuk efek loop seamless

    return (
        <div className="overflow-hidden w-full border-b border-teal-300 dark:border-teal-800 bg-transparent dark:bg-neutral-950">
            <div className="flex animate-[marquee_60s_linear_infinite] whitespace-nowrap py-2">
                {items.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-2 px-6 text-xs border-r border-neutral-100 dark:border-neutral-800">
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">{t.label}</span>
                        <span className="font-mono text-neutral-900 dark:text-neutral-100">
                            {t.persen.toFixed(1)}%
                        </span>
                        <span className={cn("font-medium text-emerald-600 dark:text-emerald-400")}>
                            {
                                t.persen >= 100 ? "Tercapai" : "Sisa : " + fmtRupiah(t.sisa)
                            }
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
});

// ─── KPI Card PBJ ─────────────────────────────────────────────────────────────

/** Konfigurasi tampilan kartu KPI. */
interface KpiCardConfig {
    id: string;
    label: string;
    description: string;
    value: string;
    sub: string;
    color: keyof typeof COLOR_MAP;
    icon: "pagu" | "paket" | "berlangsung" | "selesai";
}

/** Peta warna kartu ke class Tailwind dan nilai stroke chart. */
const COLOR_MAP = {
    teal: { bg: "bg-teal-100 dark:bg-teal-950/30", text: "text-teal-600 dark:text-teal-400", icon: "bg-teal-50 dark:bg-teal-900/50", stroke: "#0ea69eff" },
    emerald: { bg: "bg-teal-50 dark:bg-teal-950/30", text: "text-teal-600 dark:text-teal-400", icon: "bg-teal-100 dark:bg-teal-900/50", stroke: "#098d94ff" },
    violet: { bg: "bg-teal-50 dark:bg-teal-950/30", text: "text-teal-600 dark:text-teal-400", icon: "bg-teal-100 dark:bg-teal-900/50", stroke: "#098d94ff" },
    blue: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", icon: "bg-blue-100 dark:bg-blue-900/50", stroke: "#098d94ff" },
};

/** Ikon SVG per tipe KPI PBJ. */
const KpiIcon = memo(function KpiIcon({ type }: { type: KpiCardConfig["icon"] }) {
    const paths: Record<KpiCardConfig["icon"], string> = {
        pagu: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        paket: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
        berlangsung: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        selesai: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    };
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={paths[type]} />
        </svg>
    );
});

/**
 * Skeleton loading untuk satu kartu KPI saat data sedang diambil dari API.
 */
const KpiCardSkeleton = memo(function KpiCardSkeleton() {
    return (
        <div className="relative rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="space-y-2 flex-1">
                    <div className="h-3 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-7 w-32 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
            </div>
            <div className="h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800/50 mb-3" />
            <div className="h-4 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </div>
    );
});

/**
 * Komponen kartu KPI individual.
 *
 * Menampilkan label, nilai utama, deskripsi sumber, dan mini sparkline
 * sederhana berbasis data yang diterima dari `usePbjData`.
 */
const KpiCard = memo(function KpiCard({ config, onClick }: { config: KpiCardConfig; onClick?: () => void }) {
    const colors = COLOR_MAP[config.color];

    // Sparkline statis visual per jenis kartu (proporsi dekoratif)
    const sparkPatterns: Record<KpiCardConfig["icon"], number[]> = {
        pagu: [0, 0],
        paket: [0, 0],
        berlangsung: [0, 0],
        selesai: [0, 0],
    };
    const sparkData = sparkPatterns[config.icon].map((v, i) => ({ i, v }));

    return (
        <button
            onClick={onClick}
            className={cn(
                "relative text-left w-full rounded-2xl p-3 border border-teal-200 dark:border-teal-900",
                "bg-teal-50 dark:bg-neutral-950",
                "hover:shadow-xl transition-all duration-300",
                "overflow-hidden group",
                onClick && "cursor-pointer active:scale-[0.98]"
            )}
        >
            {/* Background accent glow */}
            <div className={cn(
                "absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-60 blur-2xl transition-opacity group-hover:opacity-90",
                colors.bg,
            )} />

            {/* Header: label + ikon */}
            <div className="relative flex items-start justify-between mb-3">
                <div>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium uppercase tracking-wider">
                        {config.label}
                    </p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1 tabular-nums leading-tight">
                        {config.value}
                    </p>
                </div>
                <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0", colors.icon, colors.text)}>
                    <KpiIcon type={config.icon} />
                </div>
            </div>

            {/* Sparkline mini dekoratif */}
            <div className="relative h-8 -mx-1 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                        <defs>
                            <linearGradient id={`sg-${config.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="10%" stopColor={colors.stroke} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={colors.stroke} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke={colors.stroke} strokeWidth={2} fill={`url(#sg-${config.id})`} dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Footer: sumber data */}
            <div className="relative flex items-center gap-1.5">
                <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse", colors.text.replace("text-", "bg-"))} />
                <span className="text-neutral-400 dark:text-neutral-500 text-xs truncate">{config.sub}</span>
            </div>
        </button>
    );
});

/**
 * Mengubah data `PbjSummary` menjadi konfigurasi 4 kartu KPI.
 *
 * Dipisahkan ke fungsi murni agar mudah diuji dan tidak mencemari komponen.
 *
 * @param data - Ringkasan PBJ yang sudah dinormalisasi oleh service
 * @returns Array 4 konfigurasi kartu KPI siap render
 */
function buildKpiConfigs(data: NonNullable<ReturnType<typeof usePbjData>["data"]>): KpiCardConfig[] {
    return [
        {
            id: "pagu",
            label: "Total Pagu Anggaran",
            description: "Keseluruhan nilai pagu PBJ",
            value: fmtRupiah(data.totalPagu),
            sub: `Hibah + E-Purchasing + Tender + Non-Tender`,
            color: "teal",
            icon: "pagu",
        },
        {
            id: "paket",
            label: "Total Paket",
            description: "Jumlah paket di semua jenis pengadaan",
            value: data.totalPaket.toLocaleString("id-ID"),
            sub: `${data.ePurchasing.paket} e-purchasing · ${data.tender.paket} tender`,
            color: "teal",
            icon: "paket",
        },
        {
            id: "berlangsung",
            label: "Sedang Berlangsung",
            description: "Paket yang masih aktif berjalan",
            value: data.totalBerlangsung.toLocaleString("id-ID"),
            sub: `${data.ePurchasing.onProcess} on-process · ${data.tender.berlangsung} tender`,
            color: "teal",
            icon: "berlangsung",
        },
        {
            id: "selesai",
            label: "Sudah Selesai",
            description: "Paket yang telah rampung",
            value: data.totalSelesai.toLocaleString("id-ID"),
            sub: `${data.ePurchasing.completed} e-purchasing · ${data.nonTender.selesai} non-tender`,
            color: "teal",
            icon: "selesai",
        },
    ];
}

// ─── Error Banner ─────────────────────────────────────────────────────────────

/**
 * Banner peringatan saat data PBJ gagal diambil dari API.
 * Menampilkan pesan error dan tombol retry.
 */
const KpiErrorBanner = memo(function KpiErrorBanner({
    error,
    onRetry,
}: {
    error: string;
    onRetry: () => void;
}) {
    return (
        <div className="col-span-full flex items-start gap-3 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1 min-w-0">
                <p className="text-red-700 dark:text-red-400 text-sm font-semibold">Gagal Memuat Data PBJ</p>
                <p className="text-red-600 dark:text-red-500 text-xs mt-0.5 break-words">{error}</p>
            </div>
            <button
                onClick={onRetry}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
                Coba Lagi
            </button>
        </div>
    );
});

// ─── Tooltip ─────────────────────────────────────────────────────────────────

const AreaTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl px-4 py-3 text-sm">
            <p className="text-neutral-400 text-xs mb-1">{label}</p>
            <p className="font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">{fmtUSD(payload[0].value)}</p>
            {payload[1] && <p className="text-neutral-500 text-xs mt-0.5">Volume: {fmtCompact(payload[1].value)}</p>}
        </div>
    );
};

const DonutTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-teal-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl px-4 py-3 text-sm">
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">{payload[0].name}</p>
            <p className="text-neutral-500 mt-0.5">
                {typeof payload[0].value === "number" ? payload[0].value.toFixed(2) : payload[0].value}%
            </p>
            {payload[0].payload?.rupiah !== undefined && (
                <p className="text-xs text-neutral-400 mt-0.5">{fmtRupiahFull(payload[0].payload.rupiah)}</p>
            )}
        </div>
    );
};

// ─── APBD Donut Chart Component ───────────────────────────────────────────────

/** Warna segmen untuk donut chart APBD. */
const APBD_COLORS = {
    realisasi: { fill: "teal", label: "text-teal-600 dark:text-teal-400", bg: "bg-teal-500" },
    sisa: { fill: "#71d9c941", label: "text-neutral-400", bg: "bg-neutral-300 dark:bg-neutral-600" },
} as const;

/**
 * Skeleton loading untuk satu donut chart APBD.
 */
const ApbdDonutSkeleton = memo(function ApbdDonutSkeleton() {
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
 * - Segmen biru (teal): persentase realisasi
 * - Segmen abu (neutral): persentase sisa
 *
 * Di tengah donut ditampilkan persentase realisasi sebagai angka besar
 * agar terbaca sekilas tanpa perlu membaca legenda.
 *
 * @param item  - Data item APBD yang sudah dinormalisasi
 * @param title - Judul yang ditampilkan di atas chart
 */
const ApbdDonutChart = memo(function ApbdDonutChart({ item, title, onClick }: ApbdDonutChartProps) {
    /** Data untuk PieChart: 2 segmen (realisasi + sisa). */
    const pieData = [
        { name: "Realisasi / Capaian", value: item.persenRealisasi, rupiah: item.realisasi },
        { name: "Sisa / Belum Terealisasi", value: item.persenSisa, rupiah: item.sisa },
    ];

    const isHealthy = item.persenRealisasi >= 50;

    return (
        <button
            onClick={onClick}
            disabled={!onClick}
            className={cn(
                "flex flex-col h-full rounded-lg lg:rounded-2xl bg-neutral-50 dark:bg-neutral-900 p-3 lg:p-6 text-left",
                onClick && "cursor-pointer hover:shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all",
                !onClick && "cursor-default",
            )}
            type="button"
        >
            {/* Judul */}
            <div className="mb-3">
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{title}</p>
                <p className="text-xs text-teal-700 dark:text-teal-400 mt-0.5">
                    {title == "Belanja Daerah" ? `Pagu Anggaran: ${fmtRupiah(item.anggaran)}` : `Target Penerimaan: ${fmtRupiah(item.anggaran)}`}
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
                            isAnimationActive={true}
                        >
                            <Cell fill={APBD_COLORS.realisasi.fill} />
                            <Cell fill={APBD_COLORS.sisa.fill} className="dark:fill-neutral-700" />
                        </Pie>
                        <Tooltip content={<DonutTooltip />} cursor={{ fill: "transparent" }} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Label persentase di tengah donut - dengan pointer-events-none untuk tidak halangi tooltip */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className={cn(
                        "text-2xl font-bold tabular-nums leading-none",
                        isHealthy
                            ? "text-teal-600 dark:text-teal-400"
                            : "text-teal-900 dark:text-teal-900",
                    )}>
                        {item.persenRealisasi.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-teal-500 mt-0.5 font-medium">Persentase</p>
                </div>
            </div>

            {/* Legenda + nilai rupiah */}
            <div className="space-y-2 mt-2">
                {[
                    { key: "realisasi" as const, label: title == "Belanja Daerah" ? "Realisasi Pagu" : "Capaian", value: item.realisasi, pct: item.persenRealisasi },
                    { key: "sisa" as const, label: title == "Belanja Daerah" ? "Sisa Pagu" : "Sisa Target", value: item.sisa, pct: item.persenSisa },
                ].map((row) => (
                    <div key={row.key} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", APBD_COLORS[row.key].bg)} />
                            <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{row.label}</span>
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
                        className="h-full rounded-full bg-teal-500 transition-all duration-700"
                        style={{ width: `${Math.min(100, item.persenRealisasi)}%` }}
                    />
                </div>
            </div>
        </button>
    );
});

/**
 * Wrapper panel untuk 2 donut chart APBD — menangani loading, error, dan rendering.
 *
 * Menampilkan skeleton saat loading, banner error saat gagal,
 * dan dua donut chart berdampingan saat data berhasil dimuat.
 */
const
    ApbdDonutPanel = memo(function ApbdDonutPanel({ tahun, }: { tahun: number; }) {
        const { data, isLoading, error, retry } = useApbdData(tahun);

        return (
            <div className="lg:col-span-1 bg-white dark:bg-neutral-950 rounded-2xl border border-teal-200 dark:border-teal-900 p-2 lg:p-4">
                {/* Header panel */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Anggaran Pendapatan & Belanja Daerah <b className="text-teal-800 dark:text-teal-400">{tahun}</b></h2>
                        <p className="text-xs text-neutral-500 mt-0.5">Anggaran, Realisasi, Target &amp; Selisih</p>
                    </div>
                    {isLoading && (
                        <svg className="w-4 h-4 text-teal-500 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a9 9 0 1 0 9 9" />
                        </svg>
                    )}
                </div>

                {/* Error state */}
                {error && (
                    <div className="flex flex-col items-center gap-3 py-8 text-center">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
                    <div className="grid grid-cols-2 gap-6">
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
                                onClick={() => router.visit(`${route("belanja-daerah")}?tahun=${tahun}`)}
                            />
                            <ApbdDonutChart
                                item={data.pendapatanDaerah}
                                title="Pendapatan Daerah"
                                onClick={() => router.visit(`${route("pendapatan-daerah")}?tahun=${tahun}`)}
                            />
                        </div>

                        {/* Sumber data */}

                        <div className="flex flex-col dark:bg-neutral-900 dark:border-neutral-800 justify-between  lg:flex-row items-start gap-3 p-2 border rounded-md bg-teal-50">
                            <div className="bg-white dark:bg-neutral-900 dark:border-neutral-800 border p-4 rounded-md w-full">
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{fmtRupiah(data.belanjaDaerah.realisasi)}</h2>
                                <p className="text-xs text-neutral-500 mt-0.5"> REALISASI BElANJA DAERAH</p>
                            </div>
                            <div className="bg-white dark:bg-neutral-900 dark:border-neutral-800 border p-4 rounded-md w-full">
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{fmtRupiah(data.pendapatanDaerah.realisasi)}</h2>
                                <p className="text-xs text-neutral-500 mt-0.5"> CAPAIAN PENDAPATAN DAERAH</p>
                            </div>

                            {/* <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">{data.belanjaDaerah.realisasi}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">{data.pendapatanDaerah.realisasi}</p> */}

                        </div>
                        <p className="text-[10px] text-neutral-300 dark:text-neutral-700 mt-4 text-right">
                            Sumber: dashboard.padang.go.id · {data.tahun}
                        </p>
                    </>
                )}
            </div>
        );
    });

// ─── Section Heading ──────────────────────────────────────────────────────────

const SectionHeading = ({ children, sub }: { children: ReactNode; sub?: string }) => (
    <div className="mb-5">
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{children}</h2>
        {sub && <p className="text-xs text-neutral-500 mt-0.5">{sub}</p>}
    </div>
);

// ─── Tahun Tersedia ───────────────────────────────────────────────────────────

const AVAILABLE_YEARS = [2026, 2025, 2024, 2023];


// ─── Page ─────────────────────────────────────────────────────────────────────

const DashboardPage = () => {
    /** State filter chart demo (tidak berkaitan dengan tahun PBJ). */
    const [range, setRange] = useState<TimeRange>("1M");

    /** Data chart yang difilter berdasarkan range aktif. */
    const chartData = useMemo(() => getChartData(range), [range]);

    const lastPoint = chartData[chartData.length - 1];
    const firstPoint = chartData[0];
    const overallChange = ((lastPoint.value - firstPoint.value) / firstPoint.value) * 100;
    const isOverallPos = overallChange >= 0;

    /** Hook data PBJ — mengambil dari API Dashboard Padang. */
    const { data: pbjData, isLoading: pbjLoading, error: pbjError, tahun, setTahun, retry } = usePbjData(2026);
    // Catatan: `tahun` dari usePbjData diteruskan ke ApbdDonutPanel
    // sehingga filter tahun sinkron antara KPI Cards (PBJ) dan Donut Chart (APBD).

    /** Hook data Pendapatan SKPD — diangkat ke level halaman agar bisa di-share antara Chart dan Tabel. */
    const {
        data: skpdData,
        isLoading: skpdLoading,
        error: skpdError,
        retry: skpdRetry
    } = usePendapatanSkpd(tahun);

    /** Konfigurasi 4 kartu KPI — dihitung ulang setiap kali data API berubah. */
    const kpiConfigs = useMemo(
        () => (pbjData ? buildKpiConfigs(pbjData) : null),
        [pbjData],
    );

    return (
        <div className="min-h-screen w-full max-w-screen">
            {/* ── Ticker Marquee ── */}
            <div className="pt-14 lg:pt-18">
                <PriceTicker data={skpdData} />
            </div>

            <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 lg:px-6 py-2 lg:py-8 space-y-4">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        {/* <div className="flex items-center gap-2.5 mb-1">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse" />
                            <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold tracking-widest uppercase">
                                Live Data
                            </span>
                        </div> */}
                        <h1 className="text-xl md:text-3xl font-bold uppercase text-neutral-900 dark:text-white">
                            Dashboard{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-l from-zinc-900 to-teal-700 dark:from-zinc-100 dark:to-zinc-500">
                                Pembangunan
                            </span>
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-[11px] md:text-sm mt-1">
                            Data APBD dan Pengadaan Barang dan Jasa dari Kota Padang.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-col lg:flex-wrap">
                        {/* ── Filter Tahun PBJ ── */}
                        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-teal-200 dark:border-teal-800">
                            {AVAILABLE_YEARS.map((y) => (
                                <button
                                    key={y}
                                    id={`filter-tahun-${y}`}
                                    onClick={() => setTahun(y)}
                                    className={cn(
                                        "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                                        y === tahun
                                            ? "bg-teal-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/50"
                                            : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200",
                                    )}
                                    aria-pressed={y === tahun}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>

                        {/* ── Filter Periode Chart ── */}
                        {/* <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800">
                            {TIME_RANGES.map((r) => (
                                <button
                                    key={r}
                                    id={`filter-range-${r}`}
                                    onClick={() => setRange(r)}
                                    className={cn(
                                        "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                                        r === range
                                            ? "bg-teal-600 text-white shadow-md shadow-teal-200 dark:shadow-teal-900/50"
                                            : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200",
                                    )}
                                    aria-pressed={r === range}
                                >
                                    {r}
                                </button>
                            ))}
                        </div> */}
                    </div>
                </div>

                {/* ── KPI Cards ── */}
                <section aria-label="Ringkasan KPI Pengadaan" className="mb-3 mt-3">
                    {/* Label sumber data + status loading */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                                Pengadaan Barang &amp; Jasa — Tahun {tahun}
                            </p>
                            {pbjLoading && (
                                <span className="inline-flex items-center gap-1 text-xs text-teal-500">
                                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a9 9 0 1 0 9 9" />
                                    </svg>
                                    Memuat...
                                </span>
                            )}
                            {!pbjLoading && pbjData && (
                                <span className="inline-flex items-center gap-1 text-[10px] md:text-xs text-teal-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                    Berhasil dimuat
                                </span>
                            )}
                        </div>

                        <a
                            href={`https://dashboard.padang.go.id/api/v1/pbj?tahun=${tahun}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-teal-500 hover:underline hidden sm:inline"
                        >
                            Lihat API ↗
                        </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Error state */}
                        {pbjError && (
                            <KpiErrorBanner error={pbjError} onRetry={retry} />
                        )}

                        {/* Loading state — tampilkan 4 skeleton */}
                        {pbjLoading && !pbjData && (
                            <>
                                <KpiCardSkeleton />
                                <KpiCardSkeleton />
                                <KpiCardSkeleton />
                                <KpiCardSkeleton />
                            </>
                        )}

                        {/* Success state — data nyata */}
                        {kpiConfigs?.map((cfg) => (
                            <KpiCard
                                key={cfg.id}
                                config={cfg}
                                onClick={() => router.visit(`${route("pbj.list")}?tahun=${tahun}`)}
                            />
                        ))}
                    </div>



                    {pbjData && !pbjLoading && (
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 px-2 lg:px-4">
                            {[
                                { label: "Hibah", value: fmtRupiah(pbjData.hibah.pagu) },
                                { label: "E-Purchasing", value: fmtRupiah(pbjData.ePurchasing.pagu) },
                                { label: "Tender", value: fmtRupiah(pbjData.tender.pagu) },
                                { label: "Non-Tender", value: fmtRupiah(pbjData.nonTender.pagu) },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-1.5 text-xs text-neutral-500">
                                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{item.label}:</span>
                                    <span className="tabular-nums">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Referensi sumber data */}
                    {pbjLoading && !pbjData && (
                        <div className="mt-0 flex flex-wrap gap-x-4 gap-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 animate-pulse">
                                <div className="h-4 w-120 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                            </div>
                        </div>
                    )}
                </section>

                {/* ── Main Chart + Donut ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">

                    {/* Area Chart Utama */}
                    {/* <div className="lg:col-span-2 bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                        <div className="flex items-start justify-between mb-1">
                            <SectionHeading sub={`Periode: ${range}`}>Harga Aset Utama</SectionHeading>
                            <div className="text-right">
                                <p className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 tabular-nums">
                                    {fmtUSD(lastPoint.value)}
                                </p>
                                <span className={cn("text-sm font-semibold", isOverallPos ? "text-emerald-500" : "text-red-500")}>
                                    {isOverallPos ? "▲" : "▼"} {Math.abs(overallChange).toFixed(2)}%
                                </span>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#098d94ff" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#098d94ff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:[&>line]:stroke-neutral-800" />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                                <YAxis tickFormatter={fmtCompact} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={50} />
                                <Tooltip content={<AreaTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#098d94ff"
                                    strokeWidth={2.5}
                                    fill="url(#colorMain)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: "#098d94ff", stroke: "#fff", strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div> */}

                    {/* ── 2 Donut Chart APBD (Realisasi & Sisa) ── */}
                    <ApbdDonutPanel tahun={tahun} />

                    {/* ── Bar Chart SKPD ── */}
                    <PendapatanSkpdPanel
                        tahun={tahun}
                        data={skpdData}
                        isLoading={skpdLoading}
                        error={skpdError}
                        retry={skpdRetry}
                    />

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Tabel Detail SKPD (Pindahan dari dalam Panel) ── */}
                    <PendapatanSkpdTable
                        tahun={tahun}
                        data={skpdData}
                        isLoading={skpdLoading}
                    />
                </div>
                {/* ── Pendapatan Per-SKPD (Bar Chart & Tabel) ── */}

                {/* ── Footer ── */}
                <p className="text-center text-neutral-400 dark:text-neutral-600 text-xs pb-4">
                    Data PBJ bersumber dari{" "}
                    <a
                        href="https://dashboard.padang.go.id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-500 hover:underline"
                    >
                        dashboard.padang.go.id
                    </a>
                    {" "}· Data chart aset untuk tujuan demonstrasi.
                </p>
            </div>
        </div>
    );
};

DashboardPage.layout = (page: ReactNode) => <FrontWrapper title="Dashboard Kota Padang">{page}</FrontWrapper>;

export default DashboardPage;

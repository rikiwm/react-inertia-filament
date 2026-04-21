/**
 * @file Components/Dashboard/PendapatanSkpdPanel.tsx
 *
 * Panel yang menggabungkan Bar Chart dan Tabel Pendapatan Per-SKPD
 * dari API Dashboard Kota Padang.
 *
 * Fitur:
 * - Bar Chart horizontal: Realisasi vs Anggaran per SKPD
 * - Tabel detail: nama SKPD, anggaran, realisasi, sisa, persen, badge status
 * - Filter jumlah SKPD yang ditampilkan (Top 5 / Top 10 / Semua)
 * - Loading skeleton, error state, dan retry
 * - Tooltip kustom dengan nilai Rupiah penuh
 * - Full dark mode
 */

import { Table } from "@/Components/UI/Table";
import { usePendapatanSkpd } from "@/Hooks/usePendapatanSkpd";
import { cn } from "@/Lib/Utils";
import type { PendapatanSkpdNormalized } from "@/Types/PendapatanSkpd";
import { memo, useMemo, useState } from "react";
import { route } from "ziggy-js";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

// ─── Shared Helpers ──────────────────────────────────────────────────────────

/** Format angka ke compact Rupiah (Rp 1,2 M, Rp 43 Rb, dsb.). */
export const fmtR = (v: number) =>
    new Intl.NumberFormat("id-ID", {
        notation: "compact",
        maximumFractionDigits: 1,
        style: "currency",
        currency: "IDR",
    }).format(v);

/** Format angka ke Rupiah penuh (tanpa compact) untuk tooltip. */
export const fmtRFull = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

/** Menentukan variant badge berdasarkan persentase capaian. */
export function pctVariant(pct: number): "success" | "warning" | "secondary" | "info" {
    if (pct >= 75) return "success";
    if (pct >= 50) return "info";
    if (pct >= 25) return "warning";
    return "secondary";
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

/**
 * Tooltip kustom untuk bar chart yang menampilkan nama SKPD,
 * nilai realisasi, anggaran, dan persentase capaian.
 */
const SkpdTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const realisasi = payload.find((p: any) => p.dataKey === "realisasi")?.value ?? 0;
    const anggaran = payload.find((p: any) => p.dataKey === "anggaran")?.value ?? 0;
    const pct = anggaran > 0 ? ((realisasi / anggaran) * 100).toFixed(1) : "0";

    return (
        <div className="bg-white dark:bg-neutral-900 border border-teal-200 dark:border-neutral-700 rounded-xl shadow-xl px-4 py-3 text-sm max-w-xs">
            <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{label}</p>
            <div className="space-y-1">
                <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <span className="w-2.5 h-2.5 rounded-sm bg-teal-500 flex-shrink-0" />
                        Realisasi
                    </span>
                    <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 tabular-nums">{fmtRFull(realisasi)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <span className="w-2.5 h-2.5 rounded-sm bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" />
                        Anggaran
                    </span>
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">{fmtRFull(anggaran)}</span>
                </div>
                <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-xs text-neutral-500">Capaian: </span>
                    <span className={cn("text-xs font-bold tabular-nums", Number(pct) >= 50 ? "text-emerald-500" : "text-amber-500")}>
                        {pct}%
                    </span>
                </div>
            </div>
        </div>
    );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

/**
 * Skeleton loading panel saat data SKPD sedang dimuat dari API.
 * Menampilkan skeleton bar chart.
 */
const PendapatanSkpdSkeleton = memo(function PendapatanSkpdSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="h-64 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
        </div>
    );
});

/**
 * Skeleton loading untuk tabel.
 */
export const PendapatanSkpdTableSkeleton = memo(function PendapatanSkpdTableSkeleton() {
    return (
        <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
            ))}
        </div>
    );
});

// ─── Opsi Filter ─────────────────────────────────────────────────────────────

/** Opsi jumlah SKPD yang ditampilkan di chart. */
const LIMIT_OPTIONS = [
    { label: "Top 5", value: 5 },
    { label: "Top 10", value: 10 },
    { label: "Semua", value: -1 },
];

// ─── Panel Chart ──────────────────────────────────────────────────────────────

interface PendapatanSkpdPanelProps {
    tahun: number;
    data: PendapatanSkpdNormalized[] | null;
    isLoading: boolean;
    error: string | null;
    retry: () => void;
}

/**
 * Panel Bar Chart Pendapatan Per-SKPD.
 *
 * @param tahun - Tahun anggaran
 * @param data - Data SKPD dari API
 * @param isLoading - Status loading
 * @param error - Pesan error
 * @param retry - Fungsi coba lagi
 */
export const PendapatanSkpdPanel = memo(function PendapatanSkpdPanel({
    tahun,
    data,
    isLoading,
    error,
    retry
}: PendapatanSkpdPanelProps) {
    /** Jumlah SKPD yang ditampilkan (-1 = semua). */
    const [limit, setLimit] = useState<number>(10);

    /**
     * Data yang sudah dibatasi sesuai filter limit.
     */
    const displayData = useMemo<PendapatanSkpdNormalized[]>(() => {
        if (!data) return [];
        return limit === -1 ? data : data.slice(0, limit);
    }, [data, limit]);

    /** Tinggi bar chart dihitung dari jumlah SKPD (minimal 200px). */
    const chartHeight = Math.max(200, displayData.length * 44);

    return (
        <div className="lg:col-span-1 bg-white dark:bg-neutral-950 rounded-2xl border border-teal-200 dark:border-teal-800 p-4">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        Pendapatan Per-Satuan Kerja Tahun <b className="text-teal-800 dark:text-teal-400">{tahun}</b>
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        Capaian Vs Target Pendapatan — Tahun {tahun}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Status loading inline */}
                    {isLoading && (
                        <svg className="w-4 h-4 text-teal-500 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a9 9 0 1 0 9 9" />
                        </svg>
                    )}

                    {/* Filter limit */}
                    <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800">
                        {LIMIT_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                id={`filter-skpd-${opt.value}`}
                                onClick={() => setLimit(opt.value)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                                    limit === opt.value
                                        ? "bg-teal-600 text-white shadow-md shadow-teal-200 dark:shadow-teal-900/50"
                                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200",
                                )}
                                aria-pressed={limit === opt.value}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Error State ── */}
            {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 mb-6">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                        <p className="text-red-700 dark:text-red-400 text-sm font-semibold">Gagal Memuat Data SKPD</p>
                        <p className="text-red-600 dark:text-red-500 text-xs mt-0.5 break-all">{error}</p>
                    </div>
                    <button
                        onClick={retry}
                        className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            )}

            {/* ── Loading State ── */}
            {isLoading && !data && <PendapatanSkpdSkeleton />}

            {/* ── Success — Bar Chart Only ── */}
            {data && displayData.length > 0 && (
                <div className="space-y-4 border border-neutral-100 dark:border-neutral-900 p-4 rounded-xl">
                    <ResponsiveContainer width="100%" height={chartHeight}>
                        <BarChart
                            data={displayData}
                            layout="vertical"
                            margin={{ top: 20, right: 16, left: 0, bottom: 0 }}
                            barSize={14}
                        >
                            <CartesianGrid
                                strokeDasharray="2 4"
                                horizontal={true}
                                stroke="#94a3b8"
                                className="dark:[&>line]:stroke-neutral-800"
                            />
                            <XAxis
                                type="number"
                                tickFormatter={fmtR}
                                tick={{ fontSize: 14, fill: "#94a3b8" }}
                                axisLine={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="label"
                                width={90}
                                tick={{ fontSize: 11, fill: "#64748b" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<SkpdTooltip />} cursor={{ fill: "transparent" }} />
                            <Legend
                                iconType="square"
                                iconSize={10}
                                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                                formatter={(value) => (
                                    <span className="text-neutral-600 dark:text-neutral-400">
                                        {value === "realisasi" ? "Capaian" : "Target"}
                                    </span>
                                )}
                            />
                            <Bar dataKey="anggaran" fill="#e2e8f0" radius={[0, 8, 8, 0]} name="anggaran">
                                {displayData.map((_, i) => (
                                    <Cell key={i} className="dark:fill-neutral-800" />
                                ))}
                            </Bar>
                            <Bar dataKey="realisasi" fill="#025d58" radius={[0, 8, 8, 0]} name="realisasi">
                                {displayData.map((entry, i) => (
                                    <Cell
                                        key={i}
                                        fill={
                                            entry.persen >= 75 ? "teal" :
                                                entry.persen >= 50 ? "#007470d1" :
                                                    entry.persen >= 25 ? "#007470a9" :
                                                        "#00747057"
                                        }
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Legenda warna status */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 justify-end">
                        {[
                            { color: "bg-teal-700", label: "≥ 75%" },
                            { color: "bg-teal-700/80", label: "50–74%" },
                            { color: "bg-teal-700/60", label: "25–49%" },
                            { color: "bg-teal-700/40", label: "< 25%" },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center gap-3 text-xs text-neutral-500">
                                <span className={cn("w-2 h-2 rounded-sm", s.color)} />
                                {s.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

// ─── Component Tabel (Diekspor Terpisah) ──────────────────────────────────────

interface PendapatanSkpdTableProps {
    tahun: number;
    data: PendapatanSkpdNormalized[] | null;
    isLoading: boolean;
}

/**
 * Tabel Detail Pendapatan SKPD.
 */
export const PendapatanSkpdTable = memo(function PendapatanSkpdTable({
    tahun,
    data,
    isLoading
}: PendapatanSkpdTableProps) {
    if (isLoading && !data) return <PendapatanSkpdTableSkeleton />;
    if (!data) return null;

    return (
        <div className="lg:col-span-3  space-y-4 bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-teal-800 p-3">
            <div className="flex items-center justify-between mb-2 mx-auto px-2">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                    Rincian Realisasi Pendapatan SKPD {tahun}
                    <p className="text-[10px] text-neutral-500 mt-2">asd</p>
                </h3>
                <span className="flex flex-row gap-x-2 mr-2">
                    <div className="flex flex-row gap-x-2">
                        <span className="w-2 h-2 rounded-sm bg-sky-700"></span>
                        <span className="text-neutral-500 text-[10px]">lebih dari 75%</span>
                    </div>
                    <div className="flex flex-row gap-x-2">
                        <span className="w-2 h-2 rounded-sm bg-yellow-500"></span>
                        <span className="text-neutral-500 text-[10px]">antara 50% - 75%</span>
                    </div>
                    <div className="flex flex-row gap-x-2">
                        <span className="w-2 h-2 rounded-sm bg-red-700"></span>
                        <span className="text-neutral-500 text-[10px]">kurang dari 25%</span>
                    </div>

                </span>
            </div>

            <div className="overflow-x-auto overflow-y-scroll lg:h-[500px]">
                <Table className="rounded-md w-full">
                    <Table.Head className="bg-teal-50 border-0 dark:bg-teal-600">
                        <Table.Tr>
                            <Table.Th>No.</Table.Th>
                            <Table.Th>SKPD</Table.Th>
                            <Table.Th align="right">Target</Table.Th>
                            <Table.Th align="right">Realisasi</Table.Th>
                            <Table.Th align="right">Sisa</Table.Th>
                            <Table.Th align="center">Capaian</Table.Th>
                        </Table.Tr>
                    </Table.Head>
                    <Table.Body>
                        {data.map((skpd, i) => (
                            <Table.Tr key={skpd.skpd} isEven={i % 2 === 1}>
                                <Table.Td align="center" className="w-5">
                                    {i + 1}
                                </Table.Td>
                                <Table.Td>
                                    <p className="text-neutral-900 uppercase dark:text-teal-400 text-xs mt-0.5 truncate font-semibold max-w-xs sm:max-w-md" title={skpd.label}>
                                        {skpd.label}
                                    </p>
                                    <p className="text-neutral-400  dark:font-light text-[10px] mt-0.5 truncate max-w-xs sm:max-w-md" title={skpd.skpd}>
                                        {skpd.skpd}
                                    </p>

                                </Table.Td>

                                <Table.Td align="right" noWrap className="p-0 tabular-nums text-xs">
                                    {fmtR(skpd.anggaran)}
                                </Table.Td>

                                <Table.Td align="right" noWrap variant={skpd.persen >= 100 ? "success" : skpd.persen >= 75 ? "warning" : skpd.persen >= 50 ? "info" : "danger"} className="p-0 tabular-nums text-xs font-semibold ">
                                    {fmtR(skpd.realisasi)}
                                </Table.Td>

                                <Table.Td align="right" noWrap className="p-0 tabular-nums text-xs text-neutral-500">
                                    {fmtR(skpd.sisa)}
                                </Table.Td>
                                <Table.Td align="center" className="" noWrap>
                                    <Table.Badge variant={pctVariant(skpd.persen)}>
                                        {skpd.persen.toFixed(1)}%
                                    </Table.Badge>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Body>
                </Table>
            </div>

            <p className=" text-neutral-300/90 dark:text-neutral-700 text-right">
                Sumber: <span className="text-neutral-200 font-semibold text-xs">BADAN PENGELOLAAN KEUANGAN DAN ASET DAERAH KOTA PADANG</span>
            </p>
        </div>
    );
});


export default PendapatanSkpdPanel;

/**
 * @file Pages/Dashboard/OpdDetail.tsx
 *
 * Halaman detail OPD yang menampilkan:
 * - Breakdown belanja atau pendapatan per SKPD
 * - Summary (Total Pagu, Total Realisasi, Sisa, Persentase)
 * - Data diambil dari halaman sebelumnya berdasarkan nama_opd
 * - List pendapatan detail jika type === "pendapatan"
 */
import { useOpdDetail } from "@/features/dashboard/hooks/use-opd-detail";
import { usePendapatanSkpdDetail } from "@/features/pendapatan-daerah/hooks/use-pendapatan-skpd-detail";
import { useRealisasiProgram } from "@/features/progul/hooks/use-realisasi-program";
import { useOpdPbj } from "@/features/pbj/hooks/use-opd-pbj";
import type { OpdBelanjaDetail, OpdDetailType, OpdPendapatanDetail } from "@/Services/opd-detail-service";
import type { PendapatanRekening } from "@/Types/pendapatan-skpd";
import type { PbjJenisTransaksi } from "@/Services/pbj-detail-service";
import FrontWrapper from "@/Wrappers/front-wrapper";
import { Head, router } from "@inertiajs/react";
import { BarChart3, Calendar, Package, ShoppingCart, ChevronDown, ChevronUp, Bookmark } from "lucide-react";
import React, { ReactNode, useMemo, useCallback, useState } from "react";
import { route } from "ziggy-js";
import { motion, AnimatePresence } from 'motion/react';

interface OpdDetailPageProps {
    type: OpdDetailType;
    slug: string;
    namaOpd: string;
    tahun: number;
    initialOpdDetail?: any;
    realisasiProgram?: any;
    opdPbj?: any[];
    pendapatanDetail?: any;
}

/**
 * Format Rupiah untuk display.
 */
function formatRupiah(value: number): string {
    if (value === 0) return "Rp.0";
    return `Rp.${new Intl.NumberFormat("id-ID").format(value)}`;
}

/**
 * Komponen card untuk menampilkan statistik OPD.
 */
function StatCard({
    label,
    value,
    subLabel,
    subValue,
    percentageLabel,
    percentage,
    tahun,
}: {
    label: string;
    value: string;
    subLabel?: string;
    subValue?: string;
    percentageLabel?: string;
    percentage?: number;
    tahun?: string;
}) {
    return (
        <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/80 p-2 dark:border-teal-900 dark:bg-neutral-900/60">
            <div className="mb-2 flex flex-1 justify-between rounded-md border border-teal-200 bg-teal-200/80 p-1 dark:border-teal-950 dark:bg-teal-800/10">
                <p className="text-xs font-semisemibold text-neutral-600 dark:text-teal-400">{label}</p>
                <p className="text-xs font-semisemibold text-neutral-600 dark:text-lime-300">{tahun}</p>
            </div>
            <p className="mb-2 px-2 text-2xl font-semisemibold text-neutral-900 dark:text-white">{value}</p>

            {percentage !== undefined && (
                <div className="mb-4">
                    <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                        <div
                            className="h-full rounded-full bg-teal-600 transition-all dark:bg-teal-400"
                            style={{
                                width: `${Math.min(percentage, 100)}%`,
                            }}
                        />
                    </div>
                    <p className="mt-2 text-sm font-semisemibold text-neutral-700 dark:text-neutral-300">
                        <span className="text-xs font-semisemibold text-neutral-600 dark:text-teal-400">{percentageLabel}</span> : {percentage.toFixed(1)}
                        %
                    </p>
                </div>
            )}

            {subLabel && subValue && (
                <div className="border-t border-neutral-200 pt-4 dark:border-teal-700">
                    <p className="mb-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">{subLabel}</p>
                    <p className="text-xs font-medium text-neutral-900 dark:text-white">{subValue}</p>
                </div>
            )}
        </div>
    );
}

/**
 * Komponen loading skeleton untuk card.
 */
function StatCardSkeleton() {
    return <div className="mt-4 h-36 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-700" />;
}

function TableSkeleton() {
    return <div className="mt-6 h-10 w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-700" />;
}

export interface BelanjaKegiatan {
    nama: string;
    pptk?: string;
    pagu: number;
    fisik: {
        target: number;
        realisasi: number;
        dev: number;
    };
    keuangan: {
        target: number;
        realisasi: number;
    };
}

export interface BelanjaProgram {
    no: number;
    nama: string;
    kegiatan: BelanjaKegiatan[];
}


/**
 * Komponen untuk menampilkan tabel realisasi belanja daerah.
 * Meniru struktur laporan realisasi fisik & keuangan dari gambar.
 */
function BelanjaDetailTable({ programs }: { programs: BelanjaProgram[] }) {
    if (programs.length === 0) {
        return (
            <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Tidak ada data realisasi belanja tersedia</p>
            </div>
        );
    }

    return (
        <div className="mb-6 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-neutral-900/10">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-[11px]">
                    <thead>
                        <tr className="border-b border-slate-300 bg-teal-50 dark:border-slate-700 dark:bg-teal-950/20">
                            <th rowSpan={2} className="border-r border-slate-300 px-3 py-4 text-center font-semibold text-teal-900 dark:text-teal-600">No</th>
                            <th rowSpan={2} className="border-r border-slate-300 px-4 py-4 text-center font-semibold text-teal-900 dark:text-teal-600">Program / Kegiatan</th>
                            <th rowSpan={2} className="border-r border-slate-300 px-4 py-4 text-center font-semibold text-teal-900 dark:text-teal-600 uppercase">PPTK Kegiatan</th>
                            <th rowSpan={2} className="border-r border-slate-300 px-4 py-4 text-center font-semibold text-teal-900 dark:text-teal-600 uppercase">PAGU</th>
                            <th colSpan={3} className="border-b border-r border-slate-300 px-4 py-2 text-center font-semibold text-teal-900 dark:text-teal-600 uppercase">FISIK</th>
                            <th colSpan={5} className="border-b border-slate-300 px-4 py-2 text-center font-semibold text-teal-900 dark:text-teal-600 uppercase">KEUANGAN</th>
                        </tr>
                        <tr className="border-b border-slate-300 bg-teal-50 dark:border-slate-700 dark:bg-teal-950/20">
                            <th className="border-r border-slate-300 px-2 py-2 text-center font-semibold text-teal-900 dark:text-teal-600">TARGET</th>
                            <th className="border-r border-slate-300 px-2 py-2 text-center font-semibold text-teal-900 dark:text-teal-600">REALISASI</th>
                            <th className="border-r border-slate-300 px-2 py-2 text-center font-semibold text-teal-900 dark:text-teal-600">DEV</th>
                            <th className="border-r border-slate-300 px-2 py-2 text-center font-semibold text-teal-900 dark:text-teal-600 whitespace-nowrap">TARGET (Rp)</th>
                            <th className="border-r border-slate-300 px-2 py-2 text-center font-semibold text-teal-900 dark:text-teal-600">%</th>
                            <th className="border-r border-slate-300 px-2 py-2 text-center font-semibold text-teal-900 dark:text-teal-600 whitespace-nowrap">REALISASI (Rp)</th>
                            <th className="border-r border-slate-300 px-2 py-2 text-center font-semibold text-teal-900 dark:text-teal-600">%</th>
                            <th className="px-2 py-2 text-center font-semibold text-teal-900 dark:text-teal-600 whitespace-nowrap">DEV(%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {programs.map((prog) => (
                            <React.Fragment key={prog.no}>
                                {/* Program Row */}
                                <tr className="border border-teal-200 bg-teal-50/50 font-semibold dark:border-teal-800 dark:bg-teal-900/10">
                                    <td className=" px-3 py-3 text-center text-teal-900 dark:text-teal-600">{prog.no}</td>
                                    <td className=" px-4 py-3 text-teal-900 dark:text-teal-600 uppercase">{prog.nama}</td>
                                    <td className=""></td>
                                    <td className=""></td>
                                    <td className=""></td>
                                    <td className=""></td>
                                    <td className=""></td>
                                    <td className="border-r border-teal-200 dark:border-teal-800"></td>
                                    <td className="border-r border-teal-200 dark:border-teal-800"></td>
                                    <td className="border-r border-teal-200 dark:border-teal-800"></td>
                                    <td className="border-r border-teal-200 dark:border-teal-800"></td>
                                    <td className="dark:border-teal-800"></td>
                                </tr>
                                {/* Kegiatan Rows */}
                                {prog.kegiatan.map((keg, kIdx) => {
                                    const kPercentage = keg.keuangan.target > 0 ? (keg.keuangan.realisasi / keg.keuangan.target) * 100 : 0;
                                    return (
                                        <tr key={kIdx} className="border-b border-slate-100 transition-colors hover:bg-teal-100/50 dark:border-teal-900 dark:hover:bg-teal-800/40">
                                            <td className="border-r border-slate-100 px-3 py-2.5 dark:border-teal-900"></td>
                                            <td className="border-r border-slate-100 px-8 py-2.5 text-teal-950 dark:text-neutral-300">{keg.nama}</td>
                                            <td className="border-r border-slate-100 px-4 py-2.5 text-center text-xs text-teal-950 dark:border-teal-900 dark:text-neutral-400">{keg.pptk || "-"}</td>
                                            <td className="border-r border-slate-100 px-4 py-2.5 text-right text-teal-950 dark:text-neutral-400">
                                                {formatRupiah(keg.pagu)}
                                            </td>
                                            <td className="border-r border-slate-100 px-2 py-2.5 text-center dark:border-slate-900"></td>
                                            <td className="border-r border-slate-100 px-2 py-2.5 text-center dark:border-slate-900"></td>
                                            <td className="border-r border-slate-100 px-2 py-2.5 text-center dark:border-slate-900"></td>
                                            <td className="border-r border-slate-100 px-2 py-2.5 text-right text-teal-950 dark:text-neutral-400">
                                                {formatRupiah(keg.keuangan.target)}
                                            </td>
                                            <td className="border-r border-slate-100 px-2 py-2.5 text-center dark:border-slate-900"></td>
                                            <td className="border-r border-slate-100 px-2 py-2.5 text-right text-teal-950 dark:text-neutral-200">
                                                {formatRupiah(keg.keuangan.realisasi)}
                                            </td>
                                            <td className="border-r border-slate-100 px-2 py-2.5 text-center font-medium text-teal-950 dark:text-neutral-400">
                                                {Math.round(kPercentage)}%
                                            </td>
                                            <td className="px-2 py-2.5 text-center dark:border-slate-900"></td>
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── STATUS BADGE COLOR ────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = {
    ON_PROCESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    CANCELLED_ON_REVIEW: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    CANCELLED_ON_NEGOTIATION: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    WAITING_PPK_REVIEW: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    WAITING_SELLER_CONFIRMATION: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    ON_NEGOTIATION: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    ON_ADDENDUM: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    PAYMENT_OUTSIDE_SYSTEM: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    ESIGN_IN_PROGRESS: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
};

const JENIS_COLOR: Record<PbjJenisTransaksi, string> = {
    CATALOG: "bg-teal-600 text-white",
    TENDER: "bg-yellow-600 text-white",
    "NON-TENDER": "bg-rose-600 text-white",
};

const JENIS_LABEL: Record<PbjJenisTransaksi, string> = {
    CATALOG: "E-Katalog",
    TENDER: "Tender",
    "NON-TENDER": "Non-Tender",
};

function fmtRupiahShort(v: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(v);
}

/**
 * Komponen section PBJ terkait untuk halaman detail OPD (type=belanja).
 */
function OpdPbjSection({ namaOpd, tahun, initialData }: { namaOpd: string; tahun: number, initialData?: any[] }) {
    const { data, summary, loading, error, retry } = useOpdPbj(namaOpd, tahun, initialData);
    const [activeJenis, setActiveJenis] = useState<PbjJenisTransaksi | "ALL">("CATALOG");
    const [showAll, setShowAll] = useState(false);
    const PAGE_SIZE = 8;

    const filtered = useMemo(() =>
        activeJenis === "ALL" ? data : data.filter(i => i.jenis_transaksi === activeJenis),
        [data, activeJenis]
    );

    const displayed = showAll ? filtered : filtered.slice(0, PAGE_SIZE);

    const TABS = ["ALL", "CATALOG", "TENDER", "NON-TENDER"] as const;
    const TAB_ACTIVE_CLS: Record<typeof TABS[number], string> = {
        ALL: "bg-neutral-800 text-white border-neutral-800 dark:bg-neutral-200 dark:text-neutral-900",
        CATALOG: "bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-500/20",
        TENDER: "bg-yellow-500 text-white border-yellow-500 shadow-sm shadow-yellow-400/20",
        "NON-TENDER": "bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-400/20",
    };

    return (
        <div className="mb-6 rounded-xl border border-teal-200 dark:border-teal-900 bg-white dark:bg-neutral-900/20 overflow-hidden shadow-sm">

            {/* ── Gradient Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-teal-100 dark:border-teal-900/70 bg-gradient-to-r from-teal-50 via-white to-white dark:from-teal-950/30 dark:via-transparent dark:to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 leading-tight">
                            Pengadaan Barang &amp; Jasa
                        </h3>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-0.5">
                            Data PBJ Terkait — {tahun}
                        </p>
                    </div>
                </div>
                {summary && !loading && (
                    <div className="flex items-center gap-5">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Total Paket</p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">{summary.total}</p>
                        </div>
                        <div className="text-right border-l border-teal-100 dark:border-teal-800 pl-5">
                            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Total Nilai</p>
                            <p className="text-base font-bold text-teal-700 dark:text-teal-400 tabular-nums">{fmtRupiahShort(summary.totalNilai)}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Filter Tabs ── */}
            {summary && !loading && (
                <div className="flex flex-wrap gap-2 px-4 py-3 border border-neutral-100 dark:border-neutral-800/60">
                    {TABS.map(jenis => {
                        const count = jenis === "ALL" ? summary.total : summary.byJenis[jenis]?.count ?? 0;
                        const nilai = jenis === "ALL" ? summary.totalNilai : summary.byJenis[jenis]?.nilai ?? 0;
                        const active = activeJenis === jenis;
                        return (
                            <button
                                key={jenis}
                                onClick={() => { setActiveJenis(jenis); setShowAll(false); }}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 border ${active ? TAB_ACTIVE_CLS[jenis]
                                    : "bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/50 dark:hover:bg-teal-900/10"
                                    }`}
                            >
                                <span>{jenis === "ALL" ? "Semua" : JENIS_LABEL[jenis as PbjJenisTransaksi]}</span>
                                <span className={`min-w-[20px] text-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${active ? "bg-white/25" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                                    }`}>
                                    {count}
                                </span>
                                {count > 0 && (
                                    <span className={`text-[10px] font-medium hidden lg:inline ${active ? "opacity-75" : "text-neutral-400 dark:text-neutral-500"}`}>
                                        {fmtRupiahShort(nilai)}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ── Content ── */}
            {loading ? (
                <div className="space-y-2 p-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 animate-pulse">
                            <div className="w-16 h-5 rounded-md bg-neutral-200 dark:bg-neutral-700 shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded" />
                                <div className="h-2.5 w-1/3 bg-neutral-100 dark:bg-neutral-800 rounded" />
                            </div>
                            <div className="w-16 h-4 bg-neutral-200 dark:bg-neutral-700 rounded shrink-0" />
                            <div className="w-20 h-5 bg-neutral-100 dark:bg-neutral-800 rounded-full shrink-0" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="m-4 rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/20 p-4 flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold text-orange-800 dark:text-orange-300">Gagal memuat data PBJ</p>
                        <p className="text-[11px] text-orange-600 dark:text-orange-400 mt-0.5">{error.message}</p>
                    </div>
                    <button onClick={retry} className="shrink-0 px-3 py-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors">
                        Retry
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                        <ShoppingCart className="w-7 h-7 text-neutral-300 dark:text-neutral-600" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Tidak ada data PBJ</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs">
                        Tidak ditemukan paket pengadaan yang terkait dengan OPD ini
                    </p>
                </div>
            ) : (
                <>
                    {/* Count bar */}
                    <div className="px-5 py-2 bg-neutral-50/70 dark:bg-neutral-900/20 border-b border-neutral-100 dark:border-neutral-800/40">
                        <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                            Menampilkan {displayed.length} dari {filtered.length} paket
                        </p>
                    </div>

                    <div className="divide-y divide-neutral-50 dark:divide-neutral-800/40">
                        {displayed.map((item, idx) => {
                            const namaPaket = item.nama_paket ?? item.nama_rup ?? item.rup_name ?? "-";
                            const penyedia = item.nama_penyedia ?? "-";
                            const mak = (item.mak ?? "") as string;
                            const status = (item.status ?? item.status_paket ?? "") as string;
                            const nilai = item.jenis_transaksi === "CATALOG"
                                ? (item.total ?? item.total_harga ?? 0)
                                : (item.pagu ?? item.nilai_kontrak ?? 0);
                            const rowJenisStyle = item.jenis_transaksi === "CATALOG"
                                ? "bg-teal-50/60 dark:bg-teal-900/5"
                                : item.jenis_transaksi === "TENDER"
                                    ? "bg-yellow-50/40 dark:bg-yellow-900/5"
                                    : "bg-rose-50/30 dark:bg-rose-900/5";

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.16, delay: Math.min(idx * 0.025, 0.35) }}
                                    className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-3.5 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors ${rowJenisStyle}`}
                                >
                                    {/* Jenis badge + Name */}
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <span className={`shrink-0 mt-0.5 inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px]  uppercase ${JENIS_COLOR[item.jenis_transaksi]}`}>
                                            {JENIS_LABEL[item.jenis_transaksi]}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-snug" title={namaPaket}>
                                                {namaPaket}
                                            </p>
                                            {penyedia !== "-" && (
                                                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 truncate" title={penyedia}>
                                                    {penyedia}
                                                </p>
                                            )}
                                            {/* MAK — hanya untuk E-Katalog */}

                                        </div>
                                    </div>

                                    {/* Value + Status */}
                                    <div className="flex items-center gap-2.5 shrink-0 ml-10 sm:ml-0">
                                        <span className="text-xs font-bold text-teal-700 dark:text-teal-400 tabular-nums whitespace-nowrap">
                                            {fmtRupiahShort(nilai)}
                                        </span>
                                        {status ? (
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${STATUS_BADGE[status] ?? "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"}`}>
                                                {status.replace(/_/g, " ")}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-neutral-300 dark:text-neutral-700 w-20 text-center">—</span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Show more/less */}
                    {filtered.length > PAGE_SIZE && (
                        <div className="flex justify-center py-3.5 border-t border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/40 dark:bg-neutral-900/10">
                            <button
                                onClick={() => setShowAll(v => !v)}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 hover:bg-teal-100/60 dark:hover:bg-teal-900/20 transition-colors"
                            >
                                {showAll
                                    ? <><ChevronUp className="w-3.5 h-3.5" /> Tampilkan lebih sedikit</>
                                    : <><ChevronDown className="w-3.5 h-3.5" /> Lihat semua {filtered.length} paket</>}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
/**
 * Komponen untuk menampilkan list pendapatan SKPD.
 */
function PendapatanList({ items, loading, error }: { items: PendapatanRekening[] | undefined; loading: boolean; error: Error | null }) {
    if (error && !loading) {
        return (
            <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950">
                <p className="mb-1 text-sm font-medium text-orange-800 dark:text-orange-200">Catatan: Tidak dapat memuat detail pendapatan</p>
                <p className="text-xs text-orange-700 dark:text-orange-300">{error.message}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="mb-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                ))}
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Tidak ada data pendapatan detail tersedia</p>
            </div>
        );
    }

    return (
        <div className="mb-6">
            <div className="overflow-hidden rounded-lg border border-teal-200 bg-white dark:border-teal-700 dark:bg-neutral-900/10">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-teal-200 bg-teal-100/80 dark:border-teal-700 dark:bg-teal-900/20">
                                <th className="px-4 py-3 text-left text-xs font-semisemibold text-neutral-700 dark:text-neutral-300">Kode Rekening</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300">Nama Rekening</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300">Target</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300">Realisasi</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300">%</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300">Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => {
                                const percentage = item.anggaran > 0 ? Math.round((item.realisasi / item.anggaran) * 100 * 10) / 10 : 0;
                                const profit = item.realisasi - item.anggaran;
                                return (
                                    <motion.tr
                                        key={idx}
                                        className="border-b border-teal-100 transition-colors hover:bg-teal-50 dark:border-teal-900 dark:hover:bg-teal-950/20"
                                        initial={{ opacity: 0, y: 0 }}
                                        animate={{ opacity: 1, y: 5 }}
                                        transition={{ duration: 0.2, delay: idx * 0.1 }}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-neutral-700 dark:text-neutral-300">{item.kode_rekening}</td>
                                        <td className="px-4 py-3 text-xs font-medium text-neutral-900 dark:text-white">{item.nama_rekening}</td>
                                        <td className="px-4 py-3 text-right text-xs text-neutral-700 dark:text-neutral-300">
                                            {formatRupiah(item.anggaran)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-xs font-semibold text-neutral-900 dark:text-white">
                                            {formatRupiah(item.realisasi)}
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right text-xs font-semibold ${percentage >= 100 ? "text-teal-600 dark:text-teal-400" : percentage >= 80 ? "text-green-600 dark:text-green-400" : percentage >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}
                                        >
                                            {percentage.toFixed(1)}%
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right text-xs font-semibold ${profit >= item.anggaran ? "text-teal-600 dark:text-teal-400" : "text-red-600 dark:text-red-400"}`}
                                        >
                                            {formatRupiah(profit)}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/**
 * Helper function untuk mendapatkan summary data berdasarkan type.
 */
function getSummaryData(data: OpdBelanjaDetail | OpdPendapatanDetail, type: OpdDetailType) {
    if (type === "belanja") {
        const belanjaData = data as OpdBelanjaDetail;
        return {
            pagu: belanjaData.pagu,
            realisasi: belanjaData.realisasi,
            sisa: belanjaData.sisa,
            percentage: belanjaData.persentase_anggaran,
        };
    } else {
        const pendapatanData = data as OpdPendapatanDetail;
        return {
            pagu: pendapatanData.pagu_pad,
            realisasi: pendapatanData.realisasi_pad,
            sisa: pendapatanData.sisa_pad,
            percentage: pendapatanData.persentase_pad,
        };
    }
}

/**
 * Main component untuk halaman detail OPD.
 */
function OpdDetailContent({ type, namaOpd, tahun, slug, initialOpdDetail, realisasiProgram, opdPbj, pendapatanDetail: initialPendapatanDetail }: OpdDetailPageProps) {
    // Fetch data OPD dari layanan utama
    const { data, loading, error } = useOpdDetail(type, namaOpd, tahun, initialOpdDetail);

    const pendapatanDetail = usePendapatanSkpdDetail(namaOpd, tahun, initialPendapatanDetail);

    // Fetch realisasi program untuk type belanja
    const {
        data: realisasiData,
        loading: realisasiLoading,
        error: realisasiError
    } = useRealisasiProgram(type === "belanja" ? slug : "", tahun, realisasiProgram);

    const belanjaPrograms: BelanjaProgram[] = useMemo(() => {
        if (!realisasiData || Array.isArray(realisasiData)) return [];
        return Object.keys(realisasiData).map((progName, index) => {
            const kegiatans = realisasiData[progName];
            return {
                no: index + 1,
                nama: progName,
                kegiatan: Object.keys(kegiatans).map(kegName => {
                    const keg = kegiatans[kegName];
                    return {
                        nama: kegName,
                        pptk: keg.pptk || "",
                        pagu: keg.total_anggaran,
                        fisik: { target: 0, realisasi: 0, dev: 0 },
                        keuangan: { target: keg.total_anggaran, realisasi: keg.total_realisasi }
                    };
                })
            };
        });
    }, [realisasiData]);

    // Fetch pendapatan detail SKPD jika type === "pendapatan"

    // Determine label berdasarkan type
    const labels = useMemo(
        () => ({
            title: type === "belanja" ? "Belanja Daerah" : "Pendapatan Daerah (PAD)",
            paguLabel: type === "belanja" ? "Total Pagu Anggaran Belanja" : "Total Target PAD",
            realizationLabel: type === "belanja" ? "Total Realisasi Anggaran Belanja" : "Total Realisasi PAD",
            sisaLabel: type === "belanja" ? "Total Sisa Anggaran Belanja" : "Total Sisa Target PAD",
            percentageLabel: type === "belanja" ? "Estimasi Tercapainya Target" : "Estimasi Mencapai Target",
        }),
        [type],
    );

    // Handle error state
    if (error && !loading) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
                <p className="mb-2 text-sm font-medium text-red-800 dark:text-red-200">Gagal memuat data detail OPD</p>
                <p className="text-xs text-red-700 dark:text-red-300">{error.message}</p>
            </div>
        );
    }

    // Get summary data
    const summary = data ? getSummaryData(data, type) : null;

    return (
        <>
            {/* Header dengan title */}
            <div className="mx-auto mb-8 max-w-screen-2xl px-6 lg:px-0">
                <div className="flex flex-col md:justify-between gap-6 mb-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className=" text-left">
                        <div className="flex items-end justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-lg lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                        {namaOpd}
                                    </h1>
                                    <p className="text-xs md:text-md text-neutral-500 dark:text-neutral-400 font-medium">
                                        <span className="font-medium text-teal-600 dark:text-teal-400">{data?.kd_unit}</span> - {labels.title.toLowerCase()} per satuan kerja perangkat daerah
                                    </p>
                                </div>
                            </div>
                            {/* ── Year Selector ───────────────────────────────────── */}
                            <div className="flex items-end gap-3 bg-white dark:bg-neutral-900/50 p-2 rounded-md border border-teal-100 dark:border-teal-900/50 shadow-xs justify-end">
                                <div className="bg-teal-50 dark:bg-teal-900/20 pl-2  rounded-lg text-teal-600 dark:text-teal-400">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col ">

                                    <select
                                        id="year-select"
                                        value={tahun}
                                        onChange={(e) => {
                                            const newYear = e.target.value;
                                            router.get(window.location.pathname, { tahun: newYear }, {
                                                preserveState: false,
                                                preserveScroll: true,
                                            });
                                        }}
                                        className="bg-transparent border-none p-0 pr-8 text-sm fontmedium text-neutral-900 dark:text-neutral-100 focus:ring-0 cursor-pointer"
                                    >
                                        {(() => {
                                            const currentYear = new Date().getFullYear();
                                            const years = [];
                                            for (let i = currentYear; i >= currentYear - 4; i--) {
                                                years.push(i);
                                            }
                                            return years.map((y) => (
                                                <option key={y} value={y} className="bg-white dark:bg-neutral-900">
                                                    {y}
                                                </option>
                                            ));
                                        })()}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* Summary Cards */}

                {loading || !data ? (
                    <>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <StatCardSkeleton key={i} />
                            ))}
                        </div>
                        <div className="mt-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <TableSkeleton key={i} />
                            ))}
                        </div>
                    </>
                ) : summary ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 gap-2 lg:gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label={labels.paguLabel}
                            value={formatRupiah(summary.pagu)}
                            subLabel="Tahun Anggaran"
                            subValue={String(tahun)}
                            tahun={String(tahun)}
                        />
                        <StatCard
                            label={labels.realizationLabel}
                            value={formatRupiah(summary.realisasi)}
                            percentageLabel="Persentase Realisasi"
                            percentage={(summary.realisasi / summary.pagu) * 100}
                        />
                        <StatCard
                            label={labels.sisaLabel}
                            value={formatRupiah(summary.realisasi >= summary.pagu ? 0 : summary.pagu - summary.realisasi)}
                            subLabel={
                                summary.pagu >= summary.realisasi
                                    ? "Sisa Target"
                                    : `Realisasi Melebihi Target ${formatRupiah(summary.realisasi - summary.pagu)}`
                            }
                            subValue={`${(((summary.pagu - summary.realisasi) / summary.pagu) * 100).toFixed(1)}%`}
                        />
                        <StatCard
                            label={labels.percentageLabel}
                            value={`${new Date(tahun + "-12").toLocaleString("id-ID", { month: "long", year: "numeric" })}`}
                            subLabel="Status"
                            subValue={
                                summary.pagu >= summary.realisasi
                                    ? `Sisa Target ${formatRupiah(summary.pagu - summary.realisasi)}`
                                    : ` Melebihi Target ${formatRupiah(summary.realisasi - summary.pagu)}`
                            }
                        />
                    </motion.div>
                ) : null}
            </div>

            {/* Data Detail */}
            {data && (
                <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="mx-auto max-w-screen-2xl px-4 lg:px-0">
                    {/* Pendapatan List - Show only when type === "pendapatan" */}
                    {type === "pendapatan" && (
                        <>
                            <div className="mb-2 flex flex-col gap-2 lg:mb-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h2 className="text-2xl font-medium text-neutral-900 dark:text-teal-400">Rekening Pendapatan</h2>
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{namaOpd}</span>
                                </div>
                            </div>
                            <PendapatanList
                                items={pendapatanDetail.data?.topRekening}
                                loading={pendapatanDetail.loading}
                                error={pendapatanDetail.error}
                            />
                        </>
                    )}

                    <h2 className="mb-4 text-2xl font-medium text-neutral-900 dark:text-teal-400">Detail {labels.title} {tahun}</h2>
                    {type === "belanja" ? (
                        <>
                            {/* PBJ Section — data pengadaan terkait OPD */}
                            <OpdPbjSection namaOpd={namaOpd} tahun={tahun} initialData={opdPbj} />

                            <div className="border border-teal-200 mx-auto p-2 py-2 rounded-lg ">
                                <div className="mb-2 dark:bg-teal-950 text-center bg-neutral-50 p-2 rounded-md">
                                    <h3 className="text-2xl font-medium text-slate-800 dark:text-neutral-100">
                                        Realisasi Fisik &amp; Keuangan
                                    </h3>
                                    <p className="text-xs font-medium uppercase text-teal-950 dark:text-neutral-400">
                                        Terkait Tentang Laporan Realisasi Fisik &amp; Keuangan <span className="font-medium text-teal-600 dark:text-teal-600">{namaOpd.toUpperCase()}</span>
                                    </p>
                                </div>
                                {realisasiLoading ? (
                                    <div className="space-y-3 py-6">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div key={i} className="h-16 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                                        ))}
                                    </div>
                                ) : realisasiError ? (
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
                                        <p className="mb-2 text-sm font-medium text-red-800 dark:text-red-200">Gagal memuat data realisasi program</p>
                                        <p className="text-xs text-red-700 dark:text-red-300">{realisasiError.message}</p>
                                    </div>
                                ) : (
                                    <BelanjaDetailTable programs={belanjaPrograms} />
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* <div className="my-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
                                <div className="col-span-1 rounded-lg border border-teal-200 p-2">
                                    <div className="flex items-center justify-between border-teal-200 pb-4 dark:border-teal-700">
                                        <span className="font-medium text-neutral-700 dark:text-neutral-300">Kode Unit</span>
                                        <span className="text-neutral-900 dark:text-white">{data.kd_unit}</span>
                                    </div>
                                </div>
                                <div className="col-span-1 rounded-lg border border-teal-200 p-2">
                                    <div className="flex items-center justify-between border-teal-200 pb-4 dark:border-teal-700">
                                        <span className="font-medium text-neutral-700 dark:text-neutral-300">Nama OPD</span>
                                        <span className="text-neutral-900 dark:text-white">{data.nama_opd}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-0 overflow-hidden rounded-lg border border-teal-200 bg-white p-4 dark:border-teal-950 dark:bg-neutral-900/10">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-teal-200 pb-4 dark:border-teal-700">
                                        <span className="font-medium text-neutral-700 dark:text-neutral-300">Target PAD</span>
                                        <span className="text-neutral-900 dark:text-white">
                                            {formatRupiah((data as OpdPendapatanDetail).pagu_pad)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-neutral-700 dark:text-neutral-300">Realisasi PAD</span>
                                        <span className="text-neutral-900 dark:text-white">
                                            {formatRupiah((data as OpdPendapatanDetail).realisasi_pad)}
                                        </span>
                                    </div>
                                </div>
                            </div> */}
                        </>
                    )}
                </motion.div>)}
        </>
    );
}

/**
 * Main page component.
 */
export default function OpdDetail(props: OpdDetailPageProps) {
    return (
        <>
            <Head title={`Detail ${props.namaOpd}`} />
            <div className="min-h-screen bg-transparent pt-4 pb-20">
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />
                </div>
                <OpdDetailContent {...props} />
            </div>
        </>
    );
}

OpdDetail.layout = (page: ReactNode) => <FrontWrapper title={undefined}>{page}</FrontWrapper>;

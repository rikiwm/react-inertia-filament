/**
 * @file Pages/Dashboard/OpdDetail.tsx
 *
 * Halaman detail OPD yang menampilkan:
 * - Breakdown belanja atau pendapatan per SKPD
 * - Summary (Total Pagu, Total Realisasi, Sisa, Persentase)
 * - Data diambil dari halaman sebelumnya berdasarkan nama_opd
 * - List pendapatan detail jika type === "pendapatan"
 */
import { useOpdDetail } from "@/Hooks/useOpdDetail";
import { usePendapatanSkpdDetail } from "@/Hooks/usePendapatanSkpdDetail";
import type { OpdBelanjaDetail, OpdDetailType, OpdPendapatanDetail } from "@/Services/opdDetailService";
import type { PendapatanRekening } from "@/Types/PendapatanSkpd";
import FrontWrapper from "@/Wrappers/FrontWrapper";
import { Head, router } from "@inertiajs/react";
import { ArrowLeft, Calendar } from "lucide-react";
import React, { ReactNode, useMemo, useCallback } from "react";
import { route } from "ziggy-js";

interface OpdDetailPageProps {
    type: OpdDetailType;
    slug: string;
    namaOpd: string;
    tahun: number;
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
            <div className="mb-2 flex flex-1 justify-between rounded-md border border-teal-200 bg-teal-100/80 p-1 dark:border-teal-950 dark:bg-teal-800/10">
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
    return <div className="mt-4 h-40 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-700" />;
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

const DUMMY_BELANJA_DETAIL: BelanjaProgram[] = [
    {
        no: 1,
        nama: "PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH KABUPATEN/KOTA",
        kegiatan: [
            {
                nama: "Pemeliharaan Barang Milik Daerah Penunjang Urusan Pemerintahan Daerah",
                pagu: 545725500,
                fisik: { target: 0, realisasi: 0, dev: 0 },
                keuangan: { target: 545725500, realisasi: 28860600 }
            },
            {
                nama: "Perencanaan, Penganggaran, dan Evaluasi Kinerja Perangkat Daerah",
                pagu: 46435800,
                fisik: { target: 0, realisasi: 0, dev: 0 },
                keuangan: { target: 46435800, realisasi: 5018738 }
            },
            {
                nama: "Administrasi Keuangan Perangkat Daerah",
                pagu: 14819633945,
                fisik: { target: 0, realisasi: 0, dev: 0 },
                keuangan: { target: 14819633945, realisasi: 4881151526 }
            },
            {
                nama: "Administrasi Umum Perangkat Daerah",
                pagu: 577013000,
                fisik: { target: 0, realisasi: 0, dev: 0 },
                keuangan: { target: 577013000, realisasi: 84107513 }
            },
            {
                nama: "Administrasi Kepegawaian Perangkat Daerah",
                pagu: 845569300,
                fisik: { target: 0, realisasi: 0, dev: 0 },
                keuangan: { target: 845569300, realisasi: 17604000 }
            },
            {
                nama: "Pengadaan Barang Milik Daerah Penunjang Urusan Pemerintahan Daerah",
                pagu: 61026600,
                fisik: { target: 0, realisasi: 0, dev: 0 },
                keuangan: { target: 61026600, realisasi: 49900000 }
            },
            {
                nama: "Penyediaan Jasa Penunjang Urusan Pemerintahan Daerah",
                pagu: 12780000,
                fisik: { target: 0, realisasi: 0, dev: 0 },
                keuangan: { target: 12780000, realisasi: 5311727 }
            }
        ]
    },
    {
        no: 2,
        nama: "PROGRAM PENYELENGGARAAN PENGAWASAN",
        kegiatan: [
            {
                nama: "Penyelenggaraan Pengawasan Internal",
                pagu: 541606500,
                fisik: { target: 0, realisasi: 0, dev: 0 },
                keuangan: { target: 541606500, realisasi: 96173151 }
            },
            {
                nama: "Penyelenggaraan Pengawasan dengan Tujuan Tertentu",
                pagu: 51088200,
                fisik: { target: 0, realisasi: 0, dev: 0 },
                keuangan: { target: 51088200, realisasi: 3400000 }
            }
        ]
    },
    {
        no: 3,
        nama: "PROGRAM PERUMUSAN KEBIJAKAN, PENDAMPINGAN DAN ASISTENSI",
        kegiatan: [
            {
                nama: "Perumusan Kebijakan Teknis di Bidang Pengawasan dan Fasilitasi Pengawasan",
                pagu: 11933900,
                fisik: { target: 0, realisasi: 0, dev: 0 },
                keuangan: { target: 11933900, realisasi: 0 }
            },
            {
                nama: "Pendampingan dan Asistensi",
                pagu: 129418700,
                fisik: { target: 0, realisasi: 0, dev: 0 },
                keuangan: { target: 129418700, realisasi: 11756718 }
            }
        ]
    }
];

/**
 * Komponen untuk menampilkan tabel realisasi belanja daerah.
 * Meniru struktur laporan realisasi fisik & keuangan dari gambar.
 */
function BelanjaDetailTable({ programs }: { programs: BelanjaProgram[] }) {
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
                                            <td className="border-r border-slate-100 px-4 py-2.5 text-center dark:border-teal-900"></td>
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
                            <tr className="border-b border-teal-200 bg-teal-50 dark:border-teal-700 dark:bg-teal-900/20">
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
                                    <tr
                                        key={idx}
                                        className="border-b border-teal-100 transition-colors hover:bg-teal-50 dark:border-teal-900 dark:hover:bg-teal-950/20"
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
                                    </tr>
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
function OpdDetailContent({ type, namaOpd, tahun }: Omit<OpdDetailPageProps, "slug">) {
    // Fetch data OPD dari layanan utama
    const { data, loading, error } = useOpdDetail(type, namaOpd, tahun);

    const pendapatanDetail = usePendapatanSkpdDetail(namaOpd, tahun);
    // const belanjaDetail = useBelanjaSkpdDetail(namaOpd, tahun);

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
            <div className="mx-auto mb-8 max-w-screen-2xl px-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
                    <div>
                        <h1 className="mb-2 font-semibold text-neutral-900 lg:text-3xl dark:text-neutral-100">{namaOpd}</h1>
                        <p className="xs:text-xs font-medium text-neutral-600 capitalize dark:text-neutral-400">
                            <span className="font-medium text-teal-600 dark:text-teal-400">{data?.kd_unit}</span> - {labels.title.toLowerCase()} per satuan kerja perangkat daerah
                        </p>
                    </div>

                    {/* ── Year Selector ───────────────────────────────────── */}
                    <div className="flex items-center gap-3 bg-white dark:bg-neutral-900/50 p-2 rounded-md border border-teal-100 dark:border-teal-900/50 shadow-xs">
                        <div className="bg-teal-50 dark:bg-teal-900/20 pl-2  rounded-lg text-teal-600 dark:text-teal-400">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">

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

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {loading ? (
                        <>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <StatCardSkeleton key={i} />
                            ))}
                        </>
                    ) : summary ? (
                        <>
                            <StatCard
                                label={labels.paguLabel}
                                value={formatRupiah(summary.pagu)}
                                subLabel="Tahun Anggaran"
                                subValue={String(tahun)}
                                tahun={String(tahun)}
                            />
                            <StatCard
                                label={labels.realizationLabel}
                                value={summary.realisasi ? formatRupiah(summary.realisasi) : "-"}
                                percentageLabel="Persentase Realisasi"
                                percentage={(summary.realisasi / summary.pagu) * 100}
                            />
                            <StatCard
                                label={labels.sisaLabel}
                                value={formatRupiah(summary.pagu - summary.realisasi)}
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
                                subValue={summary.percentage >= 75 ? "Sangat Baik" : summary.percentage >= 50 ? "Cukup" : "Perlu Ditingkatkan"}
                            />
                        </>
                    ) : null}
                </div>
            </div>

            {/* Data Detail */}
            {data && (
                <div className="mx-auto max-w-screen-2xl lg:px-8">
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
                            <div className="border border-teal-200 mx-auto p-2 py-2 rounded-lg ">
                                <div className="mb-2 dark:bg-teal-950 text-center bg-neutral-50 p-2 rounded-md">
                                    <h3 className="text-2xl font-medium text-slate-800 dark:text-neutral-100">
                                        Realisasi Fisik & Keuangan
                                    </h3>
                                    <p className="text-xs font-medium uppercase text-teal-950 dark:text-neutral-400">
                                        Terkait Tentang Laporan Realisasi Fisik & Keuangan <span className="font-medium text-teal-600 dark:text-teal-600">{namaOpd.toUpperCase()}</span>
                                    </p>
                                </div>
                                <BelanjaDetailTable programs={DUMMY_BELANJA_DETAIL} />
                            </div>

                        </>
                    ) : (
                        <>
                            <div className="my-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
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
                            </div>
                        </>
                    )}
                </div>
            )}
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

            <div className="min-h-screen bg-transparent pt-18 pb-20">
                <div className="mx-auto max-w-screen-2xl px-6 lg:px-8">
                    {/* Back Button */}
                    <button
                        onClick={() => window.history.back()}
                        className="mb-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-teal-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
                    >
                        <ArrowLeft className="h-3 w-4" />
                        Kembali
                    </button>
                </div>

                <OpdDetailContent {...props} />
            </div>
        </>
    );
}

OpdDetail.layout = (page: ReactNode) => <FrontWrapper title={undefined}>{page}</FrontWrapper>;

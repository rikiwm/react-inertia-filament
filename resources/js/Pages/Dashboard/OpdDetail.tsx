/**
 * @file Pages/Dashboard/OpdDetail.tsx
 *
 * Halaman detail OPD yang menampilkan:
 * - Breakdown belanja atau pendapatan per SKPD
 * - Summary (Total Pagu, Total Realisasi, Sisa, Persentase)
 * - Data diambil dari halaman sebelumnya berdasarkan nama_opd
 * - List pendapatan detail jika type === "pendapatan"
 */

import { Head } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import { ReactNode, useMemo } from "react";
import FrontWrapper from "@/Wrappers/FrontWrapper";
import { useOpdDetail } from "@/Hooks/useOpdDetail";
import { usePendapatanSkpdDetail } from "@/Hooks/usePendapatanSkpdDetail";
import type { OpdDetailType, OpdBelanjaDetail, OpdPendapatanDetail } from "@/Services/opdDetailService";
import type { PendapatanRekening } from "@/Types/PendapatanSkpd";

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
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    }).format(value);
}

/**
 * Komponen card untuk menampilkan statistik OPD.
 */
function StatCard({
    label,
    value,
    subLabel,
    subValue,
    percentage,
    tahun
}: {
    label: string;
    value: string;
    subLabel?: string;
    subValue?: string;
    percentage?: number;
    tahun?: string
}) {
    return (
        <div className="bg-teal-50/80 dark:bg-neutral-900/60 rounded-xl border border-teal-200 dark:border-teal-900 p-2 mt-4">
         <div className="flex flex-1 justify-between bg-teal-100/80 dark:bg-teal-800/10 rounded-md border border-teal-200 dark:border-teal-950 p-1 mb-2">
            <p className="text-xs font-semibold text-neutral-600 dark:text-teal-400">
                {label}
            </p>
               <p className="text-xs font-semibold text-neutral-600 dark:text-lime-300">
                {tahun}
            </p>
         </div>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2 px-2">
                {value}
            </p>

            {percentage !== undefined && (
                <div className="mb-4">
                    <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-teal-600 dark:bg-teal-400 rounded-full transition-all"
                            style={{
                                width: `${Math.min(percentage, 100)}%`,
                            }}
                        />
                    </div>
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mt-2">
                        {percentage.toFixed(1)}%
                    </p>
                </div>
            )}

            {subLabel && subValue && (
                <div className="pt-4 border-t border-neutral-200 dark:border-teal-700">
                    <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        {subLabel}
                    </p>
                    <p className="text-xs font-medium text-neutral-900 dark:text-white">
                        {subValue}
                    </p>
                </div>
            )}
        </div>
    );
}

/**
 * Komponen loading skeleton untuk card.
 */
function StatCardSkeleton() {
    return (
        <div className="bg-neutral-200 dark:bg-neutral-700 rounded-2xl h-40 animate-pulse mt-4" />
    );
}

/**
 * Komponen untuk menampilkan list pendapatan SKPD.
 */
function PendapatanList({
    items,
    loading,
    error,
}: {
    items: PendapatanRekening[] | undefined;
    loading: boolean;
    error: Error | null;
}) {
    if (error && !loading) {
        return (
            <div className="rounded-lg border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950 p-4 mb-6">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                    Catatan: Tidak dapat memuat detail pendapatan
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                    {error.message}
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-3 mb-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-16 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-4 mb-6">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Tidak ada data pendapatan detail tersedia
                </p>
            </div>
        );
    }

    return (
        <div className="mb-6">
            <div className="bg-white dark:bg-neutral-900/10 rounded-lg border border-teal-200 dark:border-teal-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                    Kode Rekening
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                    Nama Rekening
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                    Anggaran
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                    Realisasi
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                    %
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => {
                                const percentage =
                                    item.anggaran > 0
                                        ? Math.round((item.realisasi / item.anggaran) * 100 * 10) / 10
                                        : 0;

                                return (
                                    <tr
                                        key={idx}
                                        className="border-b border-teal-100 dark:border-teal-900 hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300 font-mono">
                                            {item.kode_rekening}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-medium text-neutral-900 dark:text-white">
                                            {item.nama_rekening}
                                        </td>
                                        <td className="px-4 py-3 text-right text-xs text-neutral-700 dark:text-neutral-300">
                                            {formatRupiah(item.anggaran)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-xs font-semibold text-neutral-900 dark:text-white">
                                            {formatRupiah(item.realisasi)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-xs font-semibold text-teal-600 dark:text-teal-400">
                                            {percentage.toFixed(1)}%
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
function OpdDetailContent({
    type,
    namaOpd,
    tahun,
}: Omit<OpdDetailPageProps, "slug">) {
    // Fetch data OPD dari layanan utama
    const { data, loading, error } = useOpdDetail(type, namaOpd, tahun);

    // Fetch pendapatan detail SKPD jika type === "pendapatan"
    const pendapatanDetail = usePendapatanSkpdDetail(namaOpd, tahun);

    // Determine label berdasarkan type
    const labels = useMemo(
        () => ({
            title: type === "belanja" ? "Belanja Daerah" : "Pendapatan Daerah (PAD)",
            paguLabel: type === "belanja" ? "Total Pagu Belanja" : "Total Target PAD",
            realizationLabel: type === "belanja" ? "Total Realisasi Belanja" : "Total Realisasi PAD",
            sisaLabel: type === "belanja" ? "Total Sisa Belanja" : "Total Sisa PAD",
            percentageLabel: type === "belanja" ? "Realisasi %" : "Capaian %",
        }),
        [type],
    );

    // Handle error state
    if (error && !loading) {
        return (
            <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-6">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                    Gagal memuat data detail OPD
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                    {error.message}
                </p>
            </div>
        );
    }

    // Get summary data
    const summary = data ? getSummaryData(data, type) : null;

    return (
        <>
            {/* Header dengan title */}
            <div className="mb-8 max-w-screen-2xl mx-auto px-8">
                <h1 className="lg:text-3xl font-bold  text-neutral-900 dark:text-neutral-100 mb-2">
                    {namaOpd}
                </h1>
                <p className="xs:text-xs font-medium text-neutral-600 dark:text-neutral-400 capitalize mb-6">
                     {data?.kd_unit} - {labels.title.toLowerCase()} per satuan kerja perangkat daerah
                </p>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                percentage={summary.percentage}
                            />
                            <StatCard
                                label={labels.sisaLabel}
                                value={formatRupiah(summary.sisa)}
                                subLabel="Persentase Sisa"
                                subValue={`${(100 - summary.percentage).toFixed(1)}%`}
                            />
                            <StatCard
                                label={labels.percentageLabel}
                                value={`${summary.percentage.toFixed(1)}%`}
                                subLabel="Status"
                                subValue={
                                    summary.percentage >= 75
                                        ? "Sangat Baik"
                                        : summary.percentage >= 50
                                          ? "Cukup"
                                          : "Perlu Ditingkatkan"
                                }
                            />
                        </>
                    ) : null}
                </div>
            </div>

            {/* Data Detail */}
            {data && (
                <div className="max-w-screen-2xl mx-auto lg:px-8">
                    {/* Pendapatan List - Show only when type === "pendapatan" */}
                    {type === "pendapatan" && (
                        <>
                            <h2 className="text-2xl font-medium text-neutral-900 dark:text-teal-400 mb-4">
                                Breakdown Pendapatan ({namaOpd})
                            </h2>
                            <PendapatanList
                                items={pendapatanDetail.data?.topRekening}
                                loading={pendapatanDetail.loading}
                                error={pendapatanDetail.error}
                            />
                        </>
                    )}

                    <h2 className="text-2xl font-medium text-neutral-900 dark:text-teal-400 mb-4">
                        Detail {labels.title}
                    </h2>

                    <div className="gap-2 my-2 grid grid-cols-1 lg:grid-cols-2 ">
                        <div className="col-span-1 rounded-lg p-2 border border-teal-200">
                            <div className="flex justify-between items-center pb-4  border-teal-200 dark:border-teal-700">
                                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                    Kode Unit
                                </span>
                                <span className="text-neutral-900 dark:text-white">
                                    {data.kd_unit}
                                </span>
                            </div>
                        </div>
                        <div className="col-span-1 rounded-lg p-2 border border-teal-200">
                            <div className="flex justify-between items-center pb-4  border-teal-200 dark:border-teal-700">
                                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                    Nama OPD
                                </span>
                                <span className="text-neutral-900 dark:text-white">
                                    {data.nama_opd}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900/10 rounded-lg border border-teal-200 dark:border-teal-950 p-4 overflow-hidden mt-0">
                        <div className="space-y-3">
                            {type === "belanja" ? (
                                <>
                                    <div className="flex justify-between items-center pb-4 border-b border-teal-200 dark:border-teal-700">
                                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                            Pagu Belanja
                                        </span>
                                        <span className="text-neutral-900 dark:text-white">
                                            {formatRupiah((data as OpdBelanjaDetail).pagu)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                            Realisasi Belanja
                                        </span>
                                        <span className="text-neutral-900 dark:text-white">
                                            {formatRupiah((data as OpdBelanjaDetail).realisasi)}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center pb-4 border-b border-teal-200 dark:border-teal-700">
                                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                            Target PAD
                                        </span>
                                        <span className="text-neutral-900 dark:text-white">
                                            {formatRupiah((data as OpdPendapatanDetail).pagu_pad)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                            Realisasi PAD
                                        </span>
                                        <span className="text-neutral-900 dark:text-white">
                                            {formatRupiah((data as OpdPendapatanDetail).realisasi_pad)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
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
                <div className="max-w-screen-2xl mx-auto px-6 lg:px-8">
                    {/* Back Button */}
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-teal-100 dark:hover:bg-neutral-900 rounded-lg transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-3" />
                        Kembali
                    </button>
                </div>

                <OpdDetailContent {...props} />
            </div>
        </>
    );
}

OpdDetail.layout = (page: ReactNode) => (
    <FrontWrapper title={undefined}>{page}</FrontWrapper>
);

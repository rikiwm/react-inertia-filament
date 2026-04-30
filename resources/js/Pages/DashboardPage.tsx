/**
 * @file Pages/DashboardPage.tsx
 *
 * Halaman dashboard statistik publik — KPI Cards data PBJ + Donut Chart data APBD.
 *
 * Fitur:
 * - KPI Cards PBJ real-time (Pagu, Paket, Berlangsung, Selesai)
 * - 2 Donut Chart APBD: Belanja Daerah & Pendapatan Daerah (% Realisasi & Sisa)
 * - Filter tahun anggaran (sinkron antara PBJ dan APBD)
 * - Loading skeleton & error state
 * - Pendapatan SKPD ticker & chart
 *
 * Architecture: This page is a thin composition layer.
 * Components are extracted to `features/dashboard/components/`.
 * Constants live in `features/dashboard/constants.ts`.
 */

import { cn } from "@/Lib/utils";
import { fmtRupiah } from "@/Lib/formatters";
import { usePbjData } from "@/features/pbj/hooks/use-pbj-data";
import { usePendapatanSkpd } from "@/features/pendapatan-daerah/hooks/use-pendapatan-skpd";
import FrontWrapper from "@/Wrappers/front-wrapper";
import {
    PriceTicker,
    KpiCard,
    KpiCardSkeleton,
    KpiErrorBanner,
    ApbdDonutPanel,
    PendapatanSkpdPanel,
    PendapatanSkpdTable,
} from "@/features/dashboard/components";
import { AVAILABLE_YEARS, buildKpiConfigs } from "@/features/dashboard/constants";
import { type ReactNode, useMemo } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Activity } from "lucide-react";

// ─── Page ─────────────────────────────────────────────────────────────────────

const DashboardPage = () => {
    /** Hook data PBJ — mengambil dari API Dashboard Padang. */
    const {
        data: pbjData,
        isLoading: pbjLoading,
        error: pbjError,
        tahun,
        setTahun,
        retry,
    } = usePbjData(2026);

    /** Hook data Pendapatan SKPD — di-share antara Ticker, Chart dan Tabel. */
    const {
        data: skpdData,
        isLoading: skpdLoading,
        error: skpdError,
        retry: skpdRetry,
    } = usePendapatanSkpd(tahun);

    /** Konfigurasi 4 kartu KPI — dihitung ulang setiap kali data API berubah. */
    const kpiConfigs = useMemo(
        () => (pbjData ? buildKpiConfigs(pbjData) : null),
        [pbjData],
    );

    return (
        <div className="min-h-screen w-full max-w-screen">
            {/* ── Ticker Marquee ── */}
            <div className="pt-0">
                <PriceTicker data={skpdData} />
            </div>
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />
            </div>
            <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-2 lg:py-8 space-y-4">
                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
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

                    {/* ── Filter Tahun ── */}
                    <div className="flex items-center gap-3 flex-col lg:flex-row flex-wrap">
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

                        <button
                            onClick={() => router.visit(route("analitik"))}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-teal-200 dark:border-teal-800 rounded-lg text-xs font-bold text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all shadow-sm"
                        >
                            <Activity className="w-4 h-4" />
                            Analitik & Komparasi
                        </button>
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

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {pbjError && <KpiErrorBanner error={pbjError} onRetry={retry} />}

                        {pbjLoading && !pbjData && (
                            <>
                                <KpiCardSkeleton />
                                <KpiCardSkeleton />
                                <KpiCardSkeleton />
                                <KpiCardSkeleton />
                            </>
                        )}

                        {kpiConfigs?.map((cfg) => (
                            <KpiCard
                                key={cfg.id}
                                config={cfg}
                                onClick={() => router.visit(`${route("pbj.list")}?tahun=${tahun}`)}
                            />
                        ))}
                    </div>

                    {/* Rincian per jenis PBJ */}
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

                    {/* Loading skeleton untuk rincian */}
                    {pbjLoading && !pbjData && (
                        <div className="mt-4 flex flex-wrap mx-2 gap-y-1">
                            <div className="flex items-center text-xs text-neutral-500 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 animate-pulse">
                                <div className="h-4 w-120 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                            </div>
                        </div>
                    )}
                </section>

                {/* ── Main Chart + Donut ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">
                    <ApbdDonutPanel tahun={tahun} />
                    <PendapatanSkpdPanel
                        tahun={tahun}
                        data={skpdData}
                        isLoading={skpdLoading}
                        error={skpdError}
                        retry={skpdRetry}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <PendapatanSkpdTable tahun={tahun} data={skpdData} isLoading={skpdLoading} />
                </div>

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

DashboardPage.layout = (page: ReactNode) => (
    <FrontWrapper title="Dashboard Kota Padang">{page}</FrontWrapper>
);

export default DashboardPage;

/**
 * @file features/dashboard/components/kpi-card.tsx
 *
 * KPI Card components for PBJ data display.
 * Extracted from DashboardPage.tsx.
 *
 * Includes:
 * - KpiIcon: SVG icon per KPI type
 * - KpiCardSkeleton: Loading placeholder
 * - KpiCard: Individual KPI card
 * - KpiErrorBanner: Error state banner
 */

import { memo } from "react";
import { cn } from "@/Lib/utils";
import { COLOR_MAP, type KpiCardConfig } from "../constants";

// ─── KPI Icon ────────────────────────────────────────────────────────────────

/** Ikon SVG per tipe KPI PBJ. */
export const KpiIcon = memo(function KpiIcon({
    type,
}: {
    type: KpiCardConfig["icon"];
}) {
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

// ─── KPI Card Skeleton ───────────────────────────────────────────────────────

/**
 * Skeleton loading untuk satu kartu KPI saat data sedang diambil dari API.
 */
export const KpiCardSkeleton = memo(function KpiCardSkeleton() {
    return (
        <div className="relative rounded-2xl p-3 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="space-y-1 flex-1">
                    <div className="h-1 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-4 w-32 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
            </div>
            <div className="h-8.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/50 mb-3" />
            <div className="h-4 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </div>
    );
});

// ─── KPI Card ────────────────────────────────────────────────────────────────

/**
 * Komponen kartu KPI individual.
 *
 * Menampilkan label, nilai utama, deskripsi sumber, dan mini sparkline
 * sederhana berbasis data yang diterima dari `usePbjData`.
 */
export const KpiCard = memo(function KpiCard({
    config,
    onClick,
}: {
    config: KpiCardConfig;
    onClick?: () => void;
}) {
    const colors = COLOR_MAP[config.color];

    return (
        <button
            onClick={onClick}
            className={cn(
                "relative text-left w-full rounded-xl lg:rounded-2xl p-3 border border-teal-200 dark:border-teal-900",
                "bg-teal-50 dark:bg-neutral-950",
                "hover:shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:border-white dark:hover:shadow-teal-900/20 transition-all duration-300",
                "overflow-hidden group",
                onClick && "cursor-pointer active:scale-[0.98]",
            )}
        >
            {/* Background accent glow — reduced blur for GPU performance */}
            <div
                className={cn(
                    "absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-60 blur-xl transition-opacity group-hover:opacity-90",
                    colors.bg,
                )}
            />

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
                <div
                    className={cn(
                        "flex items-center justify-center w-6 h-6 lg:w-10 lg:h-10 rounded-xl flex-shrink-0",
                        colors.icon,
                        colors.text,
                    )}
                >
                    <KpiIcon type={config.icon} />
                </div>
            </div>

            {/* Decorative gradient bar — lightweight CSS replacement for empty Recharts sparkline */}
            <div className="relative h-2 -mx-1 mb-3 rounded-lg overflow-hidden">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        background: `linear-gradient(90deg, transparent 0%, ${colors.stroke}33 30%, ${colors.stroke}55 60%, ${colors.stroke}22 100%)`,
                    }}
                />
                <div
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${colors.stroke}, transparent)`,
                    }}
                />
            </div>

            {/* Footer: sumber data */}
            <div className="relative flex items-center gap-1.5">
                <span
                    className={cn(
                        "w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse",
                        colors.text.replace("text-", "bg-"),
                    )}
                />
                <span className="text-neutral-400 dark:text-neutral-500 text-xs truncate">
                    {config.sub}
                </span>
            </div>
        </button>
    );
});

// ─── KPI Error Banner ────────────────────────────────────────────────────────

/**
 * Banner peringatan saat data PBJ gagal diambil dari API.
 * Menampilkan pesan error dan tombol retry.
 */
export const KpiErrorBanner = memo(function KpiErrorBanner({
    error,
    onRetry,
}: {
    error: string;
    onRetry: () => void;
}) {
    return (
        <div className="col-span-full flex items-start gap-3 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
            <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
            </svg>
            <div className="flex-1 min-w-0">
                <p className="text-red-700 dark:text-red-400 text-sm font-semibold">
                    Gagal Memuat Data PBJ
                </p>
                <p className="text-red-600 dark:text-red-500 text-xs mt-0.5 break-words">
                    {error}
                </p>
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

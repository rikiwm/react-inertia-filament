/**
 * @file features/dashboard/constants.ts
 *
 * Constants and pure helper functions for the Dashboard feature.
 * Extracted from DashboardPage.tsx.
 */

import type { PbjSummary } from "@/Types/pbj";
import { fmtRupiah } from "@/Lib/formatters";

// ─── Available Years ─────────────────────────────────────────────────────────

/** Tahun yang tersedia untuk filter dashboard. */
export const AVAILABLE_YEARS = [2026, 2025, 2024, 2023];

// ─── Color Maps ──────────────────────────────────────────────────────────────

/** Peta warna kartu KPI ke class Tailwind dan nilai stroke chart. */
export const COLOR_MAP = {
    teal: {
        bg: "bg-teal-100 dark:bg-teal-950/30",
        text: "text-teal-600 dark:text-teal-400",
        icon: "bg-teal-50 dark:bg-teal-900/50",
        stroke: "#0ea69eff",
    },
    emerald: {
        bg: "bg-teal-50 dark:bg-teal-950/30",
        text: "text-teal-600 dark:text-teal-400",
        icon: "bg-teal-100 dark:bg-teal-900/50",
        stroke: "#098d94ff",
    },
    violet: {
        bg: "bg-teal-50 dark:bg-teal-950/30",
        text: "text-teal-600 dark:text-teal-400",
        icon: "bg-teal-100 dark:bg-teal-900/50",
        stroke: "#098d94ff",
    },
    blue: {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        text: "text-blue-600 dark:text-blue-400",
        icon: "bg-blue-100 dark:bg-blue-900/50",
        stroke: "#098d94ff",
    },
} as const;

/** Warna segmen untuk donut chart APBD. */
export const APBD_COLORS = {
    realisasi: {
        fill: "teal",
        label: "text-teal-600 dark:text-teal-400",
        bg: "bg-teal-500",
    },
    sisa: {
        fill: "#71d9c941",
        label: "text-neutral-400",
        bg: "bg-neutral-300 dark:bg-neutral-600",
    },
} as const;

// ─── KPI Configuration ──────────────────────────────────────────────────────

/** Konfigurasi tampilan kartu KPI. */
export interface KpiCardConfig {
    id: string;
    label: string;
    description: string;
    value: string;
    sub: string;
    color: keyof typeof COLOR_MAP;
    icon: "pagu" | "paket" | "berlangsung" | "selesai";
}

/**
 * Mengubah data `PbjSummary` menjadi konfigurasi 4 kartu KPI.
 *
 * Dipisahkan ke fungsi murni agar mudah diuji dan tidak mencemari komponen.
 *
 * @param data - Ringkasan PBJ yang sudah dinormalisasi oleh service
 * @returns Array 4 konfigurasi kartu KPI siap render
 */
export function buildKpiConfigs(data: PbjSummary): KpiCardConfig[] {
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

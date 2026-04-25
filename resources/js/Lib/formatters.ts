/**
 * @file lib/formatters.ts
 *
 * Consolidated number & currency formatting utilities.
 * Single source of truth for all formatting across the application.
 */

// ─── Rupiah Formatters ───────────────────────────────────────────────────────

/** Format angka ke format compact Rupiah (43,5 M, 1,2 T, dsb.). */
export const fmtRupiah = (v: number): string =>
    new Intl.NumberFormat("id-ID", {
        notation: "compact",
        maximumFractionDigits: 1,
        style: "currency",
        currency: "IDR",
    }).format(v);

/** Format angka ke Rupiah penuh tanpa compact — digunakan di tooltip donut chart. */
export const fmtRupiahFull = (v: number): string =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(v);

/**
 * Format angka ke Rupiah compact yang lebih deskriptif.
 * Digunakan di halaman detail Belanja & Pendapatan Daerah.
 *
 * @example formatRupiahCompact(1_500_000_000) // "Rp 1,5 M"
 */
export const formatRupiahCompact = (value: number): string => {
    if (value >= 1_000_000_000_000) {
        return `Rp ${(value / 1_000_000_000_000).toFixed(1)} T`;
    }
    if (value >= 1_000_000_000) {
        return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
    }
    if (value >= 1_000_000) {
        return `Rp ${(value / 1_000_000).toFixed(1)} Jt`;
    }
    return `Rp ${value.toLocaleString("id-ID")}`;
};

// ─── Generic Number Formatters ───────────────────────────────────────────────

/** Format angka ke format compact tanpa satuan (43,5 rb, 1,2 jt). */
export const fmtCompact = (v: number): string =>
    new Intl.NumberFormat("id-ID", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(v);

/** Format angka ke format mata uang USD (untuk chart demo). */
export const fmtUSD = (v: number): string =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(v);

/** Format angka ke format Indonesia dengan separator titik. */
export const fmtNumber = (v: number): string =>
    v.toLocaleString("id-ID");

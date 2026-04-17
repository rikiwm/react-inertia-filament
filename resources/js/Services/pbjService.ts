/**
 * @file Services/pbjService.ts
 *
 * Lapisan layanan untuk API Pengadaan Barang dan Jasa (PBJ)
 * dari Dashboard Kota Padang.
 *
 * Bertanggung jawab atas:
 * - Pengambilan data dari endpoint PBJ
 * - Transformasi respons mentah ke `PbjSummary` yang siap dikonsumsi UI
 * - Pembatalan request via AbortSignal
 */

import type {
    PbjApiResponse,
    PbjEPurchasing,
    PbjHibah,
    PbjNonTender,
    PbjSummary,
    PbjTender,
} from "@/Types/Pbj";

/** URL dasar API Dashboard Padang. */
const PBJ_BASE_URL = "https://dashboard.padang.go.id/api/v1";

/**
 * Membangun URL endpoint PBJ untuk tahun tertentu.
 *
 * @param tahun - Tahun anggaran yang ingin diambil (default: tahun berjalan)
 * @returns URL lengkap sebagai string
 */
function buildPbjUrl(tahun: number | string): string {
    return `${PBJ_BASE_URL}/pbj?tahun=${tahun}`;
}

/**
 * Mengekstrak jumlah paket numerik dari string format "N / Keseluruhan".
 *
 * API mengembalikan `total_paket` dalam format string seperti "22 / Keseluruhan".
 * Fungsi ini mengambil bagian numerik pertama sebelum "/".
 *
 * @param raw - String total paket dari API (contoh: "22 / Keseluruhan")
 * @returns Angka jumlah paket, atau 0 jika parsing gagal
 *
 * @example
 * parsePacketCount("22 / Keseluruhan") // 22
 * parsePacketCount("2320 / Keseluruhan") // 2320
 */
function parsePacketCount(raw: string): number {
    const match = raw.match(/^(\d[\d,]*)/);
    return match ? parseInt(match[1].replace(",", ""), 10) : 0;
}

/**
 * Mencari item PBJ berdasarkan nama dari array item respons API.
 *
 * Menggunakan type guard agar TypeScript dapat menyempitkan tipe
 * hasil pencarian ke varian yang tepat.
 *
 * @param items - Array item dari respons API
 * @param name  - Nama jenis pengadaan yang dicari
 * @returns Item yang cocok, atau undefined jika tidak ditemukan
 */
function findItem<T extends { name: string }>(items: { name: string }[], name: string): T | undefined {
    return items.find((i) => i.name === name) as T | undefined;
}

/**
 * Mengubah respons mentah API PBJ menjadi `PbjSummary` terstruktur.
 *
 * Melakukan normalisasi tipe data:
 * - `total_paket` string → angka via `parsePacketCount()`
 * - Rekap status yang mungkin undefined → fallback ke 0
 * - Agregasi total lintas jenis pengadaan
 *
 * @param raw - Respons mentah dari API PBJ
 * @returns Data PBJ yang sudah dinormalisasi dan siap dikonsumsi UI
 */
function transformResponse(raw: PbjApiResponse): PbjSummary {
    const items = raw.result.item;

    const hibah     = findItem<PbjHibah>(items, "hibah");
    const ePurch    = findItem<PbjEPurchasing>(items, "e-purchasing");
    const tender    = findItem<PbjTender>(items, "tender");
    const nonTender = findItem<PbjNonTender>(items, "non-tender");

    const hibahPaket      = parsePacketCount(hibah?.total_paket ?? "0");
    const ePurchPaket     = parsePacketCount(ePurch?.total_paket ?? "0");
    const tenderPaket     = parsePacketCount(tender?.total_paket ?? "0");
    const nonTenderPaket  = parsePacketCount(nonTender?.total_paket ?? "0");

    return {
        totalPagu:        (hibah?.total_pagu ?? 0) + (ePurch?.total_pagu ?? 0) + (tender?.total_pagu ?? 0) + (nonTender?.total_pagu ?? 0),
        totalPaket:       hibahPaket + ePurchPaket + tenderPaket + nonTenderPaket,
        totalBerlangsung: (hibah?.total_berlangsung ?? 0) + (ePurch?.rekap?.ON_PROCESS ?? 0) + (tender?.rekap?.Berlangsung ?? 0) + (nonTender?.rekap?.Berlangsung ?? 0),
        totalSelesai:     (hibah?.total_selesai ?? 0) + (ePurch?.rekap?.COMPLETED ?? 0) + (nonTender?.rekap?.Selesai ?? 0),

        hibah: {
            pagu:        hibah?.total_pagu ?? 0,
            paket:       hibahPaket,
            berlangsung: hibah?.total_berlangsung ?? 0,
            selesai:     hibah?.total_selesai ?? 0,
        },
        ePurchasing: {
            pagu:           ePurch?.total_pagu ?? 0,
            paket:          ePurchPaket,
            onProcess:      ePurch?.rekap?.ON_PROCESS ?? 0,
            completed:      ePurch?.rekap?.COMPLETED ?? 0,
            paymentOutside: ePurch?.rekap?.PAYMENT_OUTSIDE_SYSTEM ?? 0,
        },
        tender: {
            pagu:        tender?.total_pagu ?? 0,
            paket:       tenderPaket,
            berlangsung: tender?.rekap?.Berlangsung ?? 0,
        },
        nonTender: {
            pagu:        nonTender?.total_pagu ?? 0,
            paket:       nonTenderPaket,
            berlangsung: nonTender?.rekap?.Berlangsung ?? 0,
            selesai:     nonTender?.rekap?.Selesai ?? 0,
        },
    };
}

/**
 * Mengambil data PBJ dari API Dashboard Padang untuk tahun tertentu.
 *
 * Secara otomatis menangani:
 * - Validasi status respons HTTP (melempar error jika bukan 2xx)
 * - Validasi kode sukses dari API (`code !== 200`)
 * - Pembatalan request via `AbortSignal`
 * - Transformasi data mentah ke format `PbjSummary`
 *
 * @param tahun  - Tahun anggaran PBJ yang ingin diambil
 * @param signal - AbortSignal untuk membatalkan request yang sedang berjalan
 * @returns Data PBJ yang sudah dinormalisasi
 * @throws Error jika request gagal, timeout, atau API merespons dengan kode non-200
 */
export async function fetchPbjData(
    tahun: number | string,
    signal: AbortSignal,
): Promise<PbjSummary> {
    const url = buildPbjUrl(tahun);

    const response = await fetch(url, { signal });

    if (!response.ok) {
        throw new Error(`API PBJ merespons dengan status HTTP ${response.status}`);
    }

    const json = (await response.json()) as PbjApiResponse;

    if (json.code !== 200) {
        throw new Error(`API PBJ mengembalikan kode error: ${json.code} — ${json.message}`);
    }

    return transformResponse(json);
}

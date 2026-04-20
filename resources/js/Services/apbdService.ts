/**
 * @file Services/apbdService.ts
 *
 * Lapisan layanan untuk API APBD (Anggaran Pendapatan dan Belanja Daerah)
 * dari Dashboard Kota Padang.
 *
 * Bertanggung jawab atas:
 * - Pengambilan data dari endpoint APBD
 * - Transformasi respons mentah ke `ApbdSummary` yang siap dikonsumsi UI
 * - Validasi struktur respons API
 * - Pembatalan request via AbortSignal
 */

import type { ApbdApiResponse, ApbdItemNormalized, ApbdSummary } from "@/Types/Apbd";
import { cacheManager } from "@/Utils/cacheManager";

const CACHE_KEY = "apbd_data";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes (APBD changes less frequently)

/** URL dasar API Dashboard Padang. */
const APBD_BASE_URL = "https://dashboard.padang.go.id/api/v1";

/**
 * Membangun URL endpoint APBD untuk tahun tertentu.
 *
 * @param tahun - Tahun anggaran yang ingin diambil
 * @returns URL lengkap sebagai string
 */
function buildApbdUrl(tahun: number | string): string {
    return `${APBD_BASE_URL}/apbd?tahun=${tahun}`;
}

/**
 * Menyeragamkan satu item APBD mentah menjadi bentuk ternormalisasi.
 *
 * Melakukan ekstraksi:
 * - `persen` → `persenRealisasi` (sudah numerik dari API)
 * - Menghitung `persenSisa` = 100 - persenRealisasi agar konsisten
 *   (API mengembalikan string "77.14 %" yang perlu di-parse)
 *
 * @param raw - Satu item dari array `result.item` respons API
 * @returns Item yang sudah dinormalisasi
 */
function normalizeItem(raw: ApbdApiResponse["result"]["item"][0]): ApbdItemNormalized {
    const persenRealisasi = raw.persen;
    const persenSisa      = parseFloat(raw.persentase_sisa) || (100 - persenRealisasi);

    return {
        name:            raw.name,
        anggaran:        raw.anggaran,
        realisasi:       raw.realisasi,
        sisa:            raw.sisa,
        persenRealisasi,
        persenSisa,
    };
}

/**
 * Mengubah respons mentah API APBD menjadi `ApbdSummary` terstruktur.
 *
 * Memetakan item berdasarkan `slug` sehingga urutan array dari server
 * tidak mempengaruhi hasil — lebih aman dari akses indeks [0] / [1].
 *
 * @param raw - Respons mentah dari API APBD
 * @returns Data APBD yang sudah dinormalisasi
 * @throws Error jika item "belanja-daerah" atau "pendapatan-daerah" tidak ditemukan
 */
function transformResponse(raw: ApbdApiResponse): ApbdSummary {
    const items = raw.result.item;

    const belanja    = items.find((i) => i.slug === "belanja-daerah");
    const pendapatan = items.find((i) => i.slug === "pendapatan-daerah");

    if (!belanja) {
        throw new Error("Data 'belanja-daerah' tidak ditemukan dalam respons API APBD");
    }
    if (!pendapatan) {
        throw new Error("Data 'pendapatan-daerah' tidak ditemukan dalam respons API APBD");
    }

    return {
        tahun:            raw.result.tahun,
        belanjaDaerah:    normalizeItem(belanja),
        pendapatanDaerah: normalizeItem(pendapatan),
    };
}

/**
 * Mengambil data APBD dari API Dashboard Padang untuk tahun tertentu.
 *
 * Alur:
 * 1. Kirim GET request ke endpoint APBD dengan `AbortSignal` untuk pembatalan.
 * 2. Validasi status HTTP (melempar error jika bukan 2xx).
 * 3. Validasi message sukses dari body JSON.
 * 4. Transformasi data mentah ke `ApbdSummary` via `transformResponse()`.
 *
 * @param tahun  - Tahun anggaran APBD yang ingin diambil
 * @param signal - AbortSignal untuk membatalkan request yang sedang berjalan
 * @returns Data APBD yang sudah dinormalisasi ke `ApbdSummary`
 * @throws Error jika request gagal, dibatalkan, atau validasi struktur gagal
 */
export async function fetchApbdData(
    tahun: number | string,
    signal: AbortSignal,
    options: { skipCache?: boolean } = {},
): Promise<ApbdSummary> {
    const cacheKey = cacheManager.generateKey(CACHE_KEY, { tahun });

    if (!options.skipCache) {
        const cached = cacheManager.get<ApbdSummary>(cacheKey);
        if (cached) {
            console.log(`[Cache HIT] APBD Data ${tahun}`);
            return cached;
        }
    }

    console.log(`[Cache MISS] Fetching APBD Data ${tahun} from API...`);
    const url = buildApbdUrl(tahun);

    const response = await fetch(url, { signal });

    if (!response.ok) {
        throw new Error(`API APBD merespons dengan status HTTP ${response.status}`);
    }

    const json = (await response.json()) as ApbdApiResponse;

    if (json.message !== "Success") {
        throw new Error(`API APBD mengembalikan message: "${json.message}"`);
    }

    const result = transformResponse(json);

    // Cache the result
    cacheManager.set(cacheKey, result, CACHE_TTL);

    return result;
}

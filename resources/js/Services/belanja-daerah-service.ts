/**
 * @file Services/belanjaDaerahService.ts
 *
 * Lapisan layanan untuk API Belanja Daerah (Regional Spending) breakdown per SKPD
 * dari endpoint eksternal Dashboard Kota Padang.
 *
 * Bertanggung jawab atas:
 * - Pengambilan data belanja per SKPD dari endpoint summary-report
 * - Parsing dan normalisasi data ke format yang siap dikonsumsi UI
 * - Error handling dan retry logic
 * - Caching data untuk mengurangi API calls
 */

import { cacheManager } from "@/Lib/cache-manager";

export interface SkpdBelanja {
    kd_unit: string;
    nama_opd: string;
    pagu: number;
    realisasi: number;
    sisa: number;
    persentase_anggaran: number;
}

export interface BelanjaDaerahResponse {
    tahun: number;
    total_pagu: number;
    total_realisasi: number;
    total_sisa: number;
    total_persentase: number;
    data: SkpdBelanja[];
}

const BASE_URL = "http://103.141.74.143/api/public/summary-report";
const CACHE_KEY_PREFIX = "belanja_daerah";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Fetch data belanja per SKPD untuk tahun tertentu dari API eksternal.
 * Menggunakan cache untuk mengurangi API calls.
 *
 * @param tahun - Tahun anggaran yang ingin diambil
 * @param signal - AbortSignal untuk pembatalan request
 * @param options - Cache options (skipCache, etc)
 * @returns Promise<BelanjaDaerahResponse>
 */
export async function fetchBelanjaDaerahBySkpd(
    tahun: number | string,
    signal?: AbortSignal,
    options: { skipCache?: boolean } = {},
): Promise<BelanjaDaerahResponse> {
    const cacheKey = cacheManager.generateKey(CACHE_KEY_PREFIX, { tahun });

    // Check cache first
    if (!options.skipCache) {
        const cachedData = cacheManager.get<BelanjaDaerahResponse>(cacheKey);
        if (cachedData) {
            console.log(`[Cache HIT] Belanja Daerah ${tahun} dari cache`);
            return cachedData;
        }
    }

    console.log(`[Cache MISS] Fetching Belanja Daerah ${tahun} dari API...`);

    try {
        const url = `${BASE_URL}?tahun=${tahun}`;
        console.log(url);

        const response = await fetch(url, {
            signal,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "69420",
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const rawData = await response.json();

        // Parse data dan hitung total
        const data: SkpdBelanja[] = (rawData.data || []).map(
            (item: any) => ({
                kd_unit: item.kd_unit || "",
                nama_opd: item.nama_opd || "Unknown",
                pagu: item.pagu || 0,
                realisasi: item.realisasi || 0,
                sisa: (item.pagu || 0) - (item.realisasi || 0),
                persentase_anggaran: item.persentase_anggaran || 0,
            }),
        );

        const total_pagu = data.reduce((sum, item) => sum + item.pagu, 0);
        const total_realisasi = data.reduce((sum, item) => sum + item.realisasi, 0);
        const total_sisa = total_pagu - total_realisasi;
        const total_persentase =
            total_pagu > 0 ? Math.round((total_realisasi / total_pagu) * 100 * 100) / 100 : 0;

        const result: BelanjaDaerahResponse = {
            tahun: typeof tahun === "number" ? tahun : parseInt(tahun),
            total_pagu,
            total_realisasi,
            total_sisa,
            total_persentase,
            data: data.sort((a, b) => b.realisasi - a.realisasi), // Sort by realisasi descending
        };

        // Store to cache
        cacheManager.set(cacheKey, result, CACHE_TTL);
        console.log(`[Cache SET] Belanja Daerah ${tahun} cached untuk ${CACHE_TTL / 1000}s`);

        return result;
    } catch (error) {
        console.error("Error fetching belanja daerah:", error);
        throw error;
    }
}

/**
 * Clear cache untuk Belanja Daerah.
 * Gunakan ketika ada perubahan data di backend.
 *
 * @param tahun - Optional: clear cache untuk tahun spesifik
 */
export function clearBelanjaDaerahCache(tahun?: number | string): void {
    if (tahun) {
        const cacheKey = cacheManager.generateKey(CACHE_KEY_PREFIX, { tahun });
        cacheManager.delete(cacheKey);
        console.log(`[Cache CLEARED] Belanja Daerah ${tahun}`);
    } else {
        // Clear all belanja daerah cache keys
        cacheManager.clear();
        console.log(`[Cache CLEARED] All Belanja Daerah caches`);
    }
}

/**
 * Format Rupiah currency untuk display di UI.
 * Contoh: 1234567890 → "Rp 1.234.567.890"
 *
 * @param value - Nilai numerik
 * @returns String format Rupiah
 */
export function formatRupiah(value: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Format Rupiah compact untuk display ringkas di UI.
 * Contoh: 1234567890 → "Rp 1,2 M"
 *
 * @param value - Nilai numerik
 * @returns String format Rupiah compact
 */
export function formatRupiahCompact(value: number): string {
    return new Intl.NumberFormat("id-ID", {
        notation: "compact",
        maximumFractionDigits: 1,
        style: "currency",
        currency: "IDR",
    }).format(value);
}

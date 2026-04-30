/**
 * @file Services/pendapatanDaerahService.ts
 *
 * Lapisan layanan untuk API Pendapatan Daerah (Regional Income) breakdown per SKPD
 * dari endpoint eksternal Dashboard Kota Padang.
 *
 * Bertanggung jawab atas:
 * - Pengambilan data pendapatan per SKPD dari endpoint summary-report
 * - Parsing dan normalisasi data ke format yang siap dikonsumsi UI
 * - Error handling dan retry logic
 * - Caching data untuk mengurangi API calls
 */

import { cacheManager } from "@/Lib/cache-manager";

export interface SkpdPendapatan {
    kd_unit: string;
    nama_opd: string;
    pagu_pad: number; // Pendapatan asli daerah
    realisasi_pad: number;
    sisa_pad: number;
    persentase_pad: number;
}

export interface PendapatanDaerahResponse {
    tahun: number;
    total_pagu_pads: number;
    total_realisasi_pad: number;
    total_sisa_pad: number;
    total_persentase_pad: number;
    data: SkpdPendapatan[];
}

export interface RealisasiPendapatanItem {
    kode_rekening: string;
    nama_rekening: string;
    skpd: string;
    kd_opd: string;
    realisasi: number;
    anggaran: number;
    tahun: string;
}

export interface RealisasiPendapatanCategory {
    code_rekening: string;
    name: string;
    total_realisasi: number;
    total_anggaran: number;
    persen: number;
    tahun: string;
    item: RealisasiPendapatanItem[];
}

export interface RealisasiPendapatanResponse {
    result: RealisasiPendapatanCategory[];
}

const BASE_URL = "/api/summary-report";
const CACHE_KEY_PREFIX = "pendapatan_daerah";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Fetch data pendapatan per SKPD untuk tahun tertentu dari API eksternal.
 * Menggunakan cache untuk mengurangi API calls.
 *
 * @param tahun - Tahun anggaran yang ingin diambil
 * @param signal - AbortSignal untuk pembatalan request
 * @param options - Cache options (skipCache, etc)
 * @returns Promise<PendapatanDaerahResponse>
 */
export async function fetchPendapatanDaerahBySkpd(
    tahun: number | string,
    signal?: AbortSignal,
    options: { skipCache?: boolean } = {},
): Promise<PendapatanDaerahResponse> {
    const cacheKey = cacheManager.generateKey(CACHE_KEY_PREFIX, { tahun });

    // Check cache first
    if (!options.skipCache) {
        const cachedData = cacheManager.get<PendapatanDaerahResponse>(cacheKey);
        if (cachedData) {
            console.log(`[Cache HIT] Pendapatan Daerah ${tahun} dari cache`);
            return cachedData;
        }
    }

    console.log(`[Cache MISS] Fetching Pendapatan Daerah ${tahun} dari API...`);

    try {
        const url = `${BASE_URL}?tahun=${tahun}`;
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
        const data: SkpdPendapatan[] = (rawData.data || [])
            .map((item: any) => ({
                kd_unit: item.kd_unit || "",
                nama_opd: item.nama_opd || "Unknown",
                pagu_pad: item.pagu_pad || 0,
                realisasi_pad: item.realisasi_pad || 0,
                sisa_pad: (item.pagu_pad || 0) - (item.realisasi_pad || 0),
                persentase_pad: item.persentase || 0,
            }))
            .filter((item: any) => item.pagu_pad > 1);

        const total_pagu_pads = data.reduce((sum, item) => sum + item.pagu_pad, 0);
        const total_realisasi_pad = data.reduce((sum, item) => sum + item.realisasi_pad, 0);
        const total_sisa_pad = total_pagu_pads - total_realisasi_pad;
        const total_persentase_pad =
            total_pagu_pads > 0
                ? Math.round((total_realisasi_pad / total_pagu_pads) * 100 * 100) / 100
                : 0;

        const result: PendapatanDaerahResponse = {
            tahun: typeof tahun === "number" ? tahun : parseInt(tahun),
            total_pagu_pads,
            total_realisasi_pad,
            total_sisa_pad,
            total_persentase_pad,
            data: data.sort((a, b) => b.realisasi_pad - a.realisasi_pad), // Sort by realisasi desc
        };

        // Store to cache
        cacheManager.set(cacheKey, result, CACHE_TTL);
        console.log(`[Cache SET] Pendapatan Daerah ${tahun} cached untuk ${CACHE_TTL / 1000}s`);

        return result;
    } catch (error) {
        console.error("Error fetching pendapatan daerah:", error);
        throw error;
    }
}

/**
 * Fetch data realisasi pendapatan detail (Pajak, Retribusi, etc)
 *
 * @param tahun - Tahun anggaran
 * @param signal - AbortSignal
 * @returns Promise<RealisasiPendapatanResponse>
 */
export async function fetchRealisasiPendapatan(
    tahun: number | string,
    signal?: AbortSignal,
): Promise<RealisasiPendapatanResponse> {
    const url = `/api/realisasi-pendapatan/${tahun}`;

    try {
        const response = await fetch(url, {
            signal,
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching realisasi pendapatan:", error);
        throw error;
    }
}

/**
 * Clear cache untuk Pendapatan Daerah.
 * Gunakan ketika ada perubahan data di backend.
 *
 * @param tahun - Optional: clear cache untuk tahun spesifik
 */
export function clearPendapatanDaerahCache(tahun?: number | string): void {
    if (tahun) {
        const cacheKey = cacheManager.generateKey(CACHE_KEY_PREFIX, { tahun });
        cacheManager.delete(cacheKey);
        console.log(`[Cache CLEARED] Pendapatan Daerah ${tahun}`);
    } else {
        // Clear all pendapatan daerah cache keys
        cacheManager.clear();
        console.log(`[Cache CLEARED] All Pendapatan Daerah caches`);
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

/**
 * @file Services/progulService.ts
 *
 * Layanan untuk mengelola data Program Unggulan (Progul) Kota Padang.
 * Mengambil data dari API eksternal dan menyediakan fungsi pengolahan data.
 */

export interface YearPerformance {
    tahun: number;
    target: string | number | null;
    capaian: string | number | null;
    persen: string | number | null;
    tw1: string | number | null;
    tw2: string | number | null;
    tw3: string | number | null;
    tw4: string | number | null;
    bukti_dukung: string | null;
    keterangan: string | null;
}

export interface KinerjaItem {
    id: number;
    nama_kinerja: string;
    indikator: string;
    satuan: string;
    perangkat_daerah: string;
    years: YearPerformance[];
}

export interface ActivasiItem {
    id: number;
    nama: string;
    kinerja: KinerjaItem[];
}

export interface ProgulData {
    id: number;
    nama: string;
    activasi: ActivasiItem[];
}

// Keeping these for backward compatibility if needed, but updated to match new logic
export interface ProgulCategory {
    id: number;
    name: string;
    count: number;
}

export interface ActivasiCategory {
    id: number;
    name: string;
    progul_id: number;
    count: number;
}

const API_URL = "http://103.141.74.143/api/progul";

/**
 * Mengambil semua data progul dari API.
 */
export async function fetchAllProgulData(signal?: AbortSignal): Promise<ProgulData[]> {
    try {
        const response = await fetch(API_URL, {
            signal,
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();
        return json.data || [];
    } catch (error) {
        console.error("Error fetching Progul data:", error);
        throw error;
    }
}

/**
 * Mendapatkan daftar kategori progul unik dari data terstruktur.
 */
export function getProgulCategories(data: ProgulData[]): ProgulCategory[] {
    return data.map((item) => ({
        id: item.id,
        name: item.nama,
        // Count total indicators (kinerja) in all activasi
        count: item.activasi.reduce((acc, act) => acc + act.kinerja.length, 0),
    })).sort((a, b) => a.id - b.id);
}

/**
 * Mendapatkan daftar sub-progul (activasi) untuk progul tertentu.
 */
export function getActivasiByProgul(data: ProgulData[], progulId: number): ActivasiCategory[] {
    const progul = data.find(p => p.id === progulId);
    if (!progul) return [];

    return progul.activasi.map((act) => ({
        id: act.id,
        name: act.nama,
        progul_id: progulId,
        count: act.kinerja.length,
    })).sort((a, b) => a.id - b.id);
}


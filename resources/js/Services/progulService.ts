/**
 * @file Services/progulService.ts
 *
 * Layanan untuk mengelola data Program Unggulan (Progul) Kota Padang.
 * Mengambil data dari API eksternal dan menyediakan fungsi pengolahan data.
 */

export interface ProgulItem {
    id_progul: number;
    progul: string;
    id_sub_progul: number;
    sub_progul: string;
    nama_satker: string;
    kode_satker: string;
    short_name: string;
    kinerja: string;
    indikator: string;
    satuan: string;
    tahun: string;
    tahun_mulai: string;
    tahun_selesai: string;
}

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

const API_URL = "https://dashboard.padang.go.id/api/progul-kota-padang";

/**
 * Mengambil semua data progul dari API.
 */
export async function fetchAllProgulData(signal?: AbortSignal): Promise<ProgulItem[]> {
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
 * Mendapatkan daftar kategori progul unik.
 */
export function getProgulCategories(data: ProgulItem[]): ProgulCategory[] {
    const groups: Record<number, { name: string; count: number }> = {};

    data.forEach((item) => {
        if (!groups[item.id_progul]) {
            groups[item.id_progul] = { name: item.progul, count: 0 };
        }
        groups[item.id_progul].count++;
    });

    return Object.entries(groups).map(([id, group]) => ({
        id: parseInt(id),
        name: group.name,
        count: group.count,
    })).sort((a, b) => a.id - b.id);
}

/**
 * Mendapatkan daftar sub-progul (activasi) untuk progul tertentu.
 */
export function getActivasiByProgul(data: ProgulItem[], progulId: number): ActivasiCategory[] {
    const groups: Record<number, { name: string; count: number }> = {};

    data.filter(item => item.id_progul === progulId).forEach((item) => {
        if (!groups[item.id_sub_progul]) {
            groups[item.id_sub_progul] = { name: item.sub_progul, count: 0 };
        }
        groups[item.id_sub_progul].count++;
    });

    return Object.entries(groups).map(([id, group]) => ({
        id: parseInt(id),
        name: group.name,
        progul_id: progulId,
        count: group.count,
    })).sort((a, b) => a.id - b.id);
}

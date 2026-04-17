/**
 * @file Services/pendapatanSkpdService.ts
 *
 * Lapisan layanan untuk API List Pendapatan Per-SKPD
 * dari Dashboard Kota Padang.
 *
 * Bertanggung jawab atas:
 * - Pengambilan data dari endpoint list-pendapatan-skpd
 * - Normalisasi nama SKPD untuk label chart (pemendekan)
 * - Pengurutan dan transformasi ke format yang siap dikonsumsi UI
 * - Pembatalan request via AbortSignal
 */

import type {
    PendapatanSkpdApiResponse,
    PendapatanSkpdNormalized,
} from "@/Types/PendapatanSkpd";

/** URL dasar API Dashboard Padang. */
const BASE_URL = "https://dashboard.padang.go.id/api/v1";

/**
 * Membangun URL endpoint list-pendapatan-skpd untuk tahun tertentu.
 *
 * @param tahun - Tahun anggaran yang ingin diambil
 * @returns URL lengkap sebagai string
 */
function buildUrl(tahun: number | string): string {
    return `${BASE_URL}/list-pendapatan-skpd/${tahun}`;
}

/**
 * Mempersingkat nama SKPD yang panjang menjadi label yang lebih ringkas.
 *
 * Strategi pemendekan:
 * 1. Hapus awalan umum seperti "DINAS", "BADAN", "RSUD", dll.
 * 2. Potong di tanda "&", "DAN", atau koma pertama.
 * 3. Batasi maksimum 20 karakter dengan tambahan "…" jika terpotong.
 *
 * @param name - Nama SKPD lengkap
 * @returns Nama SKPD yang sudah dipersingkat
 *
 * @example
 * shortenSkpd("DINAS LINGKUNGAN HIDUP") // "LINGKUNGAN HIDUP"
 * shortenSkpd("BADAN PENDAPATAN DAERAH") // "PENDAPATAN DAERAH"
 */
function shortenSkpd(name: string): string {
    // Cari pemendekan khusus
    const shortcuts: Record<string, string> = {
        "BADAN PENGELOLAAN KEUANGAN DAN ASET DAERAH": "BPKAD",
        "DINAS PEKERJAAN UMUM DAN PENATAAN RUANG": "PUPR",
        "DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN": "PRKP",
        "DINAS TENAGA KERJA DAN PERINDUSTRIAN": "Disnakerin",
        "DINAS PEMUDA DAN OLAHRAGA": "Dispora",
        "DINAS PEMADAM KEBAKARAN": "Damkar",
        "DINAS LINGKUNGAN HIDUP": "DLH",
        "DINAS PERIKANAN DAN PANGAN": "Diskanbang",
        "DINAS PERDAGANGAN": "Disdag",
        "DINAS PARIWISATA": "Disparta",
        "DINAS PERHUBUNGAN": "Dishub",
        "DINAS KESEHATAN": "Dinkes",
        "DINAS PERTANIAN": "Distan",
        "BADAN PENDAPATAN DAERAH": "Bapenda",
        "RSUD Dr. RASIDIN": "RSUD Rasidin",
    };

    const found = Object.keys(shortcuts).find((k) => name.toUpperCase().includes(k));
    return found ? shortcuts[found] : name.slice(0, 14) + (name.length > 14 ? "…" : "");
}

/**
 * Normalkan satu item SKPD dari API ke format `PendapatanSkpdNormalized`.
 *
 * - Menghitung sisa anggaran
 * - Mempersingkat nama untuk label chart
 * - Memilih 3 rekening teratas berdasarkan nilai realisasi terbesar
 *
 * @param raw - Item SKPD mentah dari API
 * @returns Item yang sudah dinormalisasi
 */
function normalizeItem(raw: PendapatanSkpdApiResponse[0]): PendapatanSkpdNormalized {
    const sorted = [...raw.item].sort((a, b) => b.realisasi - a.realisasi);

    return {
        skpd: raw.skpd,
        label: shortenSkpd(raw.skpd),
        realisasi: raw.total_realisasi,
        anggaran: raw.total_anggaran,
        persen: raw.persen,
        sisa: raw.total_anggaran - raw.total_realisasi,
        topRekening: sorted.slice(0, 3),
    };
}

/**
 * Mengambil data pendapatan per-SKPD dari API Dashboard Padang.
 *
 * Alur:
 * 1. GET request ke endpoint list-pendapatan-skpd/{tahun}.
 * 2. Validasi status HTTP.
 * 3. Parse JSON — API langsung mengembalikan array (bukan dibungkus `result`).
 * 4. Normalisasi setiap item, lalu urutkan descending berdasarkan total_realisasi.
 *
 * @param tahun  - Tahun anggaran yang ingin diambil
 * @param signal - AbortSignal untuk membatalkan request
 * @returns Array SKPD yang sudah dinormalisasi dan diurutkan
 * @throws Error jika request gagal atau respons bukan array valid
 */
export async function fetchPendapatanSkpd(
    tahun: number | string,
    signal: AbortSignal,
): Promise<PendapatanSkpdNormalized[]> {
    const url = buildUrl(tahun);

    const response = await fetch(url, { signal });

    if (!response.ok) {
        throw new Error(`API Pendapatan SKPD merespons dengan status HTTP ${response.status}`);
    }

    const json = await response.json();
    const data = json.result;

    // Validasi: API mengembalikan array langsung di root
    if (!Array.isArray(data)) {
        throw new Error("Respons API Pendapatan SKPD tidak berformat array yang diharapkan");
    }

    const raw = data as PendapatanSkpdApiResponse;

    return raw.map(normalizeItem).sort((a, b) => b.persen - a.persen); // descending: SKPD dengan realisasi terbesar di atas
}

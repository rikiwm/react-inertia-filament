/**
 * @file Types/Apbd.ts
 *
 * Definisi tipe data untuk respons API APBD (Anggaran Pendapatan dan Belanja Daerah)
 * dari Dashboard Kota Padang.
 *
 * Endpoint: http://103.141.75.86:8081/api/v1/apbd?tahun={tahun}
 */

// ─── API Response Shape ──────────────────────────────────────────────────────

/** Satu item APBD (Belanja Daerah atau Pendapatan Daerah). */
export interface ApbdItem {
    /** Nama item, misal: "Belanja Daerah" atau "Pendapatan Daerah". */
    name: string;
    /** Slug identifier, misal: "belanja-daerah". */
    slug: string;
    /** Total anggaran yang ditetapkan (dalam rupiah). */
    anggaran: number;
    /** Nilai realisasi yang sudah terserap (dalam rupiah). */
    realisasi: number;
    /** Nilai sisa yang belum terserap (dalam rupiah). */
    sisa: number;
    /** Persentase realisasi sebagai angka (contoh: 22.86). */
    persen: number;
    /** Persentase realisasi sebagai string (contoh: "22.86 %"). */
    persentase_realisasi: string;
    /** Persentase sisa sebagai string (contoh: "77.14 %"). */
    persentase_sisa: string;
}

/** Root struktur respons API APBD. */
export interface ApbdApiResponse {
    message: string;
    response_time: string;
    result: {
        tahun: string;
        item: ApbdItem[];
    };
}

// ─── Parsed / Normalized Types ────────────────────────────────────────────────

/**
 * Data APBD yang sudah dinormalisasi dan siap dikonsumsi oleh komponen UI.
 * Named fields menggantikan indeks array yang rawan salah.
 */
export interface ApbdSummary {
    /** Tahun anggaran dari API. */
    tahun: string;
    /** Data Belanja Daerah yang dinormalisasi. */
    belanjaDaerah: ApbdItemNormalized;
    /** Data Pendapatan Daerah yang dinormalisasi. */
    pendapatanDaerah: ApbdItemNormalized;
}

/** Satu item APBD yang sudah dinormalisasi dengan tipe yang konsisten. */
export interface ApbdItemNormalized {
    /** Nama item asli dari API. */
    name: string;
    /** Total anggaran dalam rupiah. */
    anggaran: number;
    /** Nilai realisasi dalam rupiah. */
    realisasi: number;
    /** Nilai sisa dalam rupiah. */
    sisa: number;
    /** Persentase realisasi sebagai angka desimal (0–100). */
    persenRealisasi: number;
    /** Persentase sisa sebagai angka desimal (0–100). */
    persenSisa: number;
}

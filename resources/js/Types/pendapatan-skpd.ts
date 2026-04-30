/**
 * @file Types/PendapatanSkpd.ts
 *
 * Definisi tipe data untuk respons API List Pendapatan Per-SKPD
 * dari Dashboard Kota Padang.
 *
 * Endpoint: http://103.141.75.86:8081/api/v1/list-pendapatan-skpd/{tahun}
 */

// ─── API Response Shape ───────────────────────────────────────────────────────

/** Satu rekening rincian pendapatan dalam sebuah SKPD. */
export interface PendapatanRekening {
    /** Kode rekening anggaran (format: "4.1.xx.xx.xxx.xxxxx."). */
    kode_rekening: string;
    /** Nama rekening / jenis pendapatan. */
    nama_rekening: string;
    /** Kode OPD/SKPD. */
    kd_opd: string;
    /** Nilai realisasi yang sudah terealisasi (dalam rupiah). */
    realisasi: number;
    /** Nilai anggaran yang ditetapkan (dalam rupiah). */
    anggaran: number;
    /** Tahun anggaran. */
    tahun: string;
}

/** Satu SKPD dengan akumulasi pendapatan dan rincian per rekening. */
export interface PendapatanSkpdItem {
    /** Nama SKPD (Satuan Kerja Perangkat Daerah). */
    skpd: string;
    /** Total nilai realisasi seluruh rekening SKPD ini (dalam rupiah). */
    total_realisasi: number;
    /** Total nilai anggaran seluruh rekening SKPD ini (dalam rupiah). */
    total_anggaran: number;
    /** Persentase realisasi terhadap anggaran (0–100). */
    persen: number;
    /** Tahun anggaran. */
    tahun: string;
    /** Daftar rekening rincian pendapatan. */
    item: PendapatanRekening[];
}

/**
 * Root respons API List Pendapatan SKPD.
 * API tidak membungkus dalam objek `result` — array langsung di root.
 */
export type PendapatanSkpdApiResponse = PendapatanSkpdItem[];

// ─── Normalized / Derived Types ───────────────────────────────────────────────

/** Data satu SKPD yang sudah dinormalisasi dan siap dikonsumsi komponen UI. */
export interface PendapatanSkpdNormalized {
    /** Nama SKPD (dipendekan jika terlalu panjang untuk label chart). */
    skpd: string;
    /** Nama SKPD dipendekan untuk label bar chart. */
    label: string;
    /** Total realisasi dalam rupiah. */
    realisasi: number;
    /** Total anggaran dalam rupiah. */
    anggaran: number;
    /** Persentase realisasi (0–100). */
    persen: number;
    /** Nilai sisa anggaran (anggaran - realisasi). */
    sisa: number;
    /** 3 rekening teratas berdasarkan nilai realisasi (untuk detail tabel). */
    topRekening: PendapatanRekening[];
}

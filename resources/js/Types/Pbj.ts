/**
 * @file Types/Pbj.ts
 *
 * Definisi tipe data untuk respons API Pengadaan Barang dan Jasa (PBJ)
 * dari Dashboard Kota Padang.
 *
 * Endpoint: http://103.141.75.86:8081/api/v1/pbj?tahun={tahun}
 */

// ─── API Response Shape ──────────────────────────────────────────────────────

/** Rekap status untuk jenis pengadaan Hibah. */
export interface HibahRekapStatus {
    [key: string]: number;
}

/** Item jenis pengadaan Hibah. */
export interface PbjHibah {
    name: "hibah";
    description: string;
    /** Format: "22 / Keseluruhan" — jumlah paket aktif dari keseluruhan. */
    total_paket: string;
    /** Nilai pagu anggaran dalam rupiah. */
    total_pagu: number;
    total_proses: number;
    total_berlangsung: number;
    total_selesai: number;
    rekap_status: HibahRekapStatus[];
}

/** Item jenis pengadaan E-Purchasing. */
export interface PbjEPurchasing {
    name: "e-purchasing";
    description: string;
    total_paket: string;
    total_pagu: number;
    total_belum: string;
    total_proses: string;
    total_berlangsung: string;
    total_selesai: string;
    rekap: {
        ON_PROCESS: number;
        COMPLETED: number;
        PAYMENT_OUTSIDE_SYSTEM: number;
    };
}

/** Item jenis pengadaan Tender. */
export interface PbjTender {
    name: "tender";
    description: string;
    total_paket: string;
    total_pagu: number;
    total_belum: string;
    total_proses: string;
    total_berlangsung: string;
    total_selesai: string;
    rekap: {
        Berlangsung: number;
    };
}

/** Item jenis pengadaan Non-Tender. */
export interface PbjNonTender {
    name: "non-tender";
    description: string;
    total_paket: string;
    total_pagu: number;
    total_belum: string;
    total_proses: string;
    total_berlangsung: string;
    total_selesai: string;
    rekap: {
        Selesai?: number;
        Berlangsung?: number;
    };
}

/** Union type semua item PBJ. */
export type PbjItem = PbjHibah | PbjEPurchasing | PbjTender | PbjNonTender;

/** Root struktur respons API PBJ. */
export interface PbjApiResponse {
    code: number;
    message: string;
    response_time: string;
    result: {
        tahun: string;
        item: PbjItem[];
    };
}

// ─── Derived / Parsed Types ───────────────────────────────────────────────────

/**
 * Data PBJ yang sudah diparsing dan siap dikonsumsi oleh komponen UI.
 * Semua nilai sudah dinormalisasi ke tipe yang benar.
 */
export interface PbjSummary {
    /** Total pagu dari semua jenis pengadaan (dalam rupiah). */
    totalPagu: number;
    /** Total paket dari semua jenis pengadaan. */
    totalPaket: number;
    /** Total paket yang sedang berlangsung. */
    totalBerlangsung: number;
    /** Total paket yang sudah selesai. */
    totalSelesai: number;

    /** Detail per jenis pengadaan. */
    hibah: {
        pagu: number;
        paket: number;
        berlangsung: number;
        selesai: number;
    };
    ePurchasing: {
        pagu: number;
        paket: number;
        onProcess: number;
        completed: number;
        paymentOutside: number;
    };
    tender: {
        pagu: number;
        paket: number;
        berlangsung: number;
    };
    nonTender: {
        pagu: number;
        paket: number;
        berlangsung: number;
        selesai: number;
    };
}

/**
 * @file Services/pbjDetailService.ts
 *
 * Service untuk mengambil data detail Pengadaan Barang/Jasa (PBJ)
 * Mendukung E-Katalog (Catalog), Tender, dan Non-Tender.
 */

export type PbjJenisTransaksi = "CATALOG" | "TENDER" | "NON-TENDER";

export interface PbjDetailItem {
    // Flag tambahan dari Backend
    jenis_transaksi: PbjJenisTransaksi;

    // --- Common (bisa ada di sebagian besar) ---
    nama_satker?: string;
    kd_satker?: string | number;
    nama_penyedia?: string;
    kd_penyedia?: string | number;
    pagu?: number;
    nilai_kontrak?: number;

    // --- CATALOG FIELDS ---
    kd_paket?: string | number;
    no_paket?: string | number;
    kd_rup?: string | number;
    nama_paket?: string;
    total_harga?: number;
    tanggal_buat?: string;
    status?: any;

    // --- TENDER FIELDS ---
    kd_tender?: string | number;
    kd_rup_paket?: string | number;
    nama_rup?: string;
    tgl_pengumuman_tender?: string;

    // --- NON-TENDER FIELDS ---
    kd_nontender?: string | number;

    [key: string]: any; // fallback untuk data lainnya yang tidak terdefinisi
}

export const pbjDetailService = {
    fetchPbjList: async (tahun: number): Promise<PbjDetailItem[]> => {
        try {
            const response = await fetch(`/api/pbj-inaproc?tahun=${tahun}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch PBJ list: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error in fetchPbjList:", error);
            throw error;
        }
    }
};

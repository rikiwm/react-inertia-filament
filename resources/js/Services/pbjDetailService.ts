/**
 * @file Services/pbjDetailService.ts
 *
 * Service untuk mengambil data detail Pengadaan Barang/Jasa (PBJ)
 * Mendukung E-Katalog (Catalog), Tender, dan Non-Tender.
 */

export type PbjJenisTransaksi = "CATALOG" | "TENDER" | "NON-TENDER";

export interface PbjDetailItem {
    count_product: number;
    fiscal_year: number;
    funding_source: string;
    kode_klpd: string;
    kode_penyedia: string;
    kode_satker: string;
    last_update_date: string;
    mak: string;
    nama_satker: string;
    order_date: string;
    order_id: string;
    rekan_id: number;
    rup_code: string;
    rup_desc: string;
    rup_name: string;
    shipment_status: string;
    shipping_fee: number;
    status: string;
    total: number;
    total_qty: number;
    nama_penyedia?: string;
    jenis_transaksi: PbjJenisTransaksi;
}

const DUMMY_PBJ_LIST: PbjDetailItem[] = [
    // --- CATALOG (E-Purchasing) ---
    {
        count_product: 2,
        fiscal_year: 2026,
        funding_source: "APBD",
        kode_klpd: "K1",
        kode_penyedia: "01ABCXYZ123",
        kode_satker: "SK-001",
        last_update_date: "2026-04-01T10:00:00Z",
        mak: "AB.1234.DEF.567.890",
        nama_satker: "Sekretariat Daerah Kota Padang",
        order_date: "2026-03-15T00:00:00Z",
        order_id: "ORD-2026-001",
        rekan_id: 1,
        rup_code: "20260001",
        rup_desc: "Pengadaan Perangkat TIK",
        rup_name: "Laptop & Printer Kantor",
        shipment_status: "COMPLETED",
        shipping_fee: 0,
        status: "COMPLETED",
        total: 156000000,
        total_qty: 12,
        nama_penyedia: "PT. Global Teknologi Nusantara",
        jenis_transaksi: "CATALOG"
    },
    {
        count_product: 5,
        fiscal_year: 2026,
        funding_source: "APBD",
        kode_klpd: "K1",
        kode_penyedia: "VNDR-11",
        kode_satker: "SK-002",
        last_update_date: "2026-04-10T14:20:00Z",
        mak: "CC.999.001.22",
        nama_satker: "Dinas Kesehatan",
        order_date: "2026-04-02T00:00:00Z",
        order_id: "ORD-2026-045",
        rekan_id: 2,
        rup_code: "20261122",
        rup_desc: "Masker medis dan APD",
        rup_name: "Alat Pelindung Diri (APD)",
        shipment_status: "SHIPPING",
        shipping_fee: 50000,
        status: "ON_PROCESS",
        total: 89750000,
        total_qty: 500,
        nama_penyedia: "CV. Medika Sejahtera",
        jenis_transaksi: "CATALOG"
    },
    // --- TENDER ---
    {
        count_product: 1,
        fiscal_year: 2026,
        funding_source: "APBD",
        kode_klpd: "K1",
        kode_penyedia: "TDR-88",
        kode_satker: "SK-003",
        last_update_date: "2026-04-15T09:00:00Z",
        mak: "TND.101.444.55",
        nama_satker: "Dinas Pendidikan",
        order_date: "2026-03-20T00:00:00Z",
        order_id: "TND-2026-101",
        rekan_id: 10,
        rup_code: "20269901",
        rup_desc: "Pembangunan Gedung Sekolah SMPN 5",
        rup_name: "Pembangunan Gedung SMPN 5",
        shipment_status: "COMPLETED",
        shipping_fee: 0,
        status: "COMPLETED",
        total: 2500000000,
        total_qty: 1,
        nama_penyedia: "PT. Konstruksi Jaya",
        jenis_transaksi: "TENDER"
    },
    {
        count_product: 1,
        fiscal_year: 2026,
        funding_source: "APBD",
        kode_klpd: "K1",
        kode_penyedia: "TDR-89",
        kode_satker: "SK-004",
        last_update_date: "2026-04-18T11:00:00Z",
        mak: "TND.202.333",
        nama_satker: "Dinas Pekerjaan Umum",
        order_date: "2026-03-25T00:00:00Z",
        order_id: "TND-2026-102",
        rekan_id: 11,
        rup_code: "20269902",
        rup_desc: "Rehabilitasi Jembatan Siteba",
        rup_name: "Rehabilitasi Jembatan",
        shipment_status: "PREPARING",
        shipping_fee: 0,
        status: "ON_PROCESS",
        total: 1200000000,
        total_qty: 1,
        nama_penyedia: "PT. Karya Abadi",
        jenis_transaksi: "TENDER"
    },
    // --- NON-TENDER ---
    {
        count_product: 10,
        fiscal_year: 2026,
        funding_source: "APBD",
        kode_klpd: "K1",
        kode_penyedia: "NT-01",
        kode_satker: "SK-005",
        last_update_date: "2026-04-12T08:30:00Z",
        mak: "NT.777.000",
        nama_satker: "Diskominfo",
        order_date: "2026-04-10T00:00:00Z",
        order_id: "NT-2026-001",
        rekan_id: 20,
        rup_code: "20267701",
        rup_desc: "Pengadaan Lisensi Software Antivirus",
        rup_name: "Lisensi Antivirus Pusat",
        shipment_status: "COMPLETED",
        shipping_fee: 0,
        status: "COMPLETED",
        total: 45000000,
        total_qty: 10,
        nama_penyedia: "CV. IT Solusi",
        jenis_transaksi: "NON-TENDER"
    },
    {
        count_product: 20,
        fiscal_year: 2026,
        funding_source: "APBD",
        kode_klpd: "K1",
        kode_penyedia: "NT-02",
        kode_satker: "SK-002",
        last_update_date: "2026-04-14T10:00:00Z",
        mak: "NT.777.001",
        nama_satker: "Dinas Kesehatan",
        order_date: "2026-04-11T00:00:00Z",
        order_id: "NT-2026-002",
        rekan_id: 21,
        rup_code: "20267702",
        rup_desc: "Belanja ATK Kantor",
        rup_name: "Belanja ATK Rutin",
        shipment_status: "COMPLETED",
        shipping_fee: 0,
        status: "COMPLETED",
        total: 8000000,
        total_qty: 20,
        nama_penyedia: "Toko ATK Sejahtera",
        jenis_transaksi: "NON-TENDER"
    },
    // --- More Data for Pagination ---
    {
        count_product: 1,
        fiscal_year: 2026,
        funding_source: "APBD",
        kode_klpd: "K1",
        kode_penyedia: "CAT-11",
        kode_satker: "SK-001",
        last_update_date: "2026-04-15T10:00:00Z",
        mak: "AB.111",
        nama_satker: "Sekretariat Daerah Kota Padang",
        order_date: "2026-04-12T00:00:00Z",
        order_id: "ORD-2026-100",
        rekan_id: 1,
        rup_code: "20261100",
        rup_name: "Pengadaan AC Split",
        rup_desc: "AC 1 PK untuk ruang rapat",
        shipment_status: "COMPLETED",
        shipping_fee: 0,
        status: "COMPLETED",
        total: 5400000,
        total_qty: 1,
        nama_penyedia: "CV. Elektro Padang",
        jenis_transaksi: "CATALOG"
    },
    {
        count_product: 100,
        fiscal_year: 2026,
        funding_source: "APBD",
        kode_klpd: "K1",
        kode_penyedia: "CAT-12",
        kode_satker: "SK-006",
        last_update_date: "2026-04-16T10:00:00Z",
        mak: "DPP.222",
        nama_satker: "Dinas Pertanian",
        order_date: "2026-04-13T00:00:00Z",
        order_id: "ORD-2026-101",
        rekan_id: 30,
        rup_code: "20262200",
        rup_name: "Bibit Jagung Hibrida",
        rup_desc: "Bibit untuk kelompok tani",
        shipment_status: "COMPLETED",
        shipping_fee: 200000,
        status: "COMPLETED",
        total: 12500000,
        total_qty: 100,
        nama_penyedia: "Toko Tani Makmur",
        jenis_transaksi: "CATALOG"
    }
];

export const pbjDetailService = {
    /**
     * Mengambil daftar paket pengadaan berdasarkan tahun.
     */
    fetchPbjList: async (tahun: number): Promise<PbjDetailItem[]> => {
        // Simulasi network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                const filtered = DUMMY_PBJ_LIST.filter(item => item.fiscal_year === tahun);
                resolve(filtered);
            }, 500);
        });
    }
};

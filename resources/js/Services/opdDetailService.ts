/**
 * @file Services/opdDetailService.ts
 *
 * Lapisan layanan untuk fetch dan process data detail OPD dari Belanja atau Pendapatan Daerah.
 * Menangani:
 * - Fetch full data dari source (belanja atau pendapatan)
 * - Find matching OPD berdasarkan nama_opd
 * - Calculate totals (sum of all data)
 * - Format response sesuai dengan type
 */

import {
    fetchBelanjaDaerahBySkpd,
    type BelanjaDaerahResponse,
    type SkpdBelanja,
} from "./belanjaDaerahService";
import {
    fetchPendapatanDaerahBySkpd,
    type PendapatanDaerahResponse,
    type SkpdPendapatan,
} from "./pendapatanDaerahService";

export type OpdDetailType = "belanja" | "pendapatan";

export interface OpdBelanjaDetail {
    kd_unit: string;
    nama_opd: string;
    pagu: number;
    realisasi: number;
    sisa: number;
    persentase_anggaran: number;
    // Totals untuk summary
    total_pagu: number;
    total_realisasi: number;
    total_sisa: number;
    total_persentase: number;
}

export interface OpdPendapatanDetail {
    kd_unit: string;
    nama_opd: string;
    pagu_pad: number;
    realisasi_pad: number;
    sisa_pad: number;
    persentase_pad: number;
    // Totals untuk summary
    total_pagu_pad: number;
    total_realisasi_pad: number;
    total_sisa_pad: number;
    total_persentase_pad: number;
}

export type OpdDetailResponse = OpdBelanjaDetail | OpdPendapatanDetail;

/**
 * Fetch detail OPD dari Belanja Daerah berdasarkan nama_opd.
 * Include totals untuk summary display.
 *
 * @param namaOpd - Nama OPD untuk dicari
 * @param tahun - Tahun anggaran
 * @param signal - AbortSignal untuk pembatalan request
 * @returns Promise<OpdBelanjaDetail>
 */
export async function fetchOpdBelanjaDetail(
    namaOpd: string,
    tahun: number | string = new Date().getFullYear(),
    signal?: AbortSignal,
): Promise<OpdBelanjaDetail> {
    // Fetch full belanja data
    console.log('fetchBelanjaDaerahBySkpd', tahun);

    const belanjaResponse: BelanjaDaerahResponse = await fetchBelanjaDaerahBySkpd(tahun, signal);

    // Find matching OPD
    const opdData = belanjaResponse.data.find(
        (item: SkpdBelanja) => item.nama_opd.toLowerCase() === namaOpd.toLowerCase(),
    );

    if (!opdData) {
        throw new Error(`OPD dengan nama "${namaOpd}" tidak ditemukan di Belanja Daerah`);
    }

    return {
        ...opdData,
        total_pagu: belanjaResponse.total_pagu,
        total_realisasi: belanjaResponse.total_realisasi,
        total_sisa: belanjaResponse.total_sisa,
        total_persentase: belanjaResponse.total_persentase,
    };
}

/**
 * Fetch detail OPD dari Pendapatan Daerah berdasarkan nama_opd.
 * Include totals untuk summary display.
 *
 * @param namaOpd - Nama OPD untuk dicari
 * @param tahun - Tahun anggaran
 * @param signal - AbortSignal untuk pembatalan request
 * @returns Promise<OpdPendapatanDetail>
 */
export async function fetchOpdPendapatanDetail(
    namaOpd: string,
    tahun: number | string = new Date().getFullYear(),
    signal?: AbortSignal,
): Promise<OpdPendapatanDetail> {
    // Fetch full pendapatan data
    const pendapatanResponse: PendapatanDaerahResponse = await fetchPendapatanDaerahBySkpd(
        tahun,
        signal,
    );

    // Find matching OPD
    const opdData = pendapatanResponse.data.find(
        (item: SkpdPendapatan) => item.nama_opd.toLowerCase() === namaOpd.toLowerCase(),
    );

    if (!opdData) {
        throw new Error(`OPD dengan nama "${namaOpd}" tidak ditemukan di Pendapatan Daerah`);
    }

    return {
        ...opdData,
        total_pagu_pad: pendapatanResponse.total_pagu_pads,
        total_realisasi_pad: pendapatanResponse.total_realisasi_pad,
        total_sisa_pad: pendapatanResponse.total_sisa_pad,
        total_persentase_pad: pendapatanResponse.total_persentase_pad,
    };
}

/**
 * Fetch detail OPD berdasarkan type (belanja atau pendapatan).
 * Simplified function untuk dynamic type selection.
 *
 * @param type - Type data: "belanja" atau "pendapatan"
 * @param namaOpd - Nama OPD untuk dicari
 * @param tahun - Tahun anggaran
 * @param signal - AbortSignal untuk pembatalan request
 * @returns Promise<OpdDetailResponse>
 */
export async function fetchOpdDetail(
    type: OpdDetailType,
    namaOpd: string,
    tahun?: number | string,
    signal?: AbortSignal,
): Promise<OpdDetailResponse> {
    if (type === "belanja") {
        return fetchOpdBelanjaDetail(namaOpd, tahun, signal);
    } else {
        return fetchOpdPendapatanDetail(namaOpd, tahun, signal);
    }
}

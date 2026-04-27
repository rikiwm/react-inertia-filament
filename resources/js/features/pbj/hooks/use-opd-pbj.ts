/**
 * @file Hooks/use-opd-pbj.ts
 *
 * Hook untuk mengambil data PBJ (Catalog + Tender + Non-Tender) yang
 * terkait dengan sebuah OPD berdasarkan kecocokan `nama_satker`.
 *
 * Digunakan di halaman OpdDetail ketika `type === "belanja"` untuk
 * menampilkan rincian pengadaan barang/jasa OPD tersebut.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { pbjCatalogService, pbjTenderService, pbjNonTenderService } from "@/Services/pbj-split-service";
import type { PbjDetailItem, PbjJenisTransaksi } from "@/Services/pbj-detail-service";

export interface OpdPbjItem extends PbjDetailItem {
    jenis_transaksi: PbjJenisTransaksi;
}

export interface OpdPbjSummary {
    total: number;
    totalNilai: number;
    byJenis: Record<PbjJenisTransaksi, { count: number; nilai: number }>;
}

export interface UseOpdPbjResult {
    data: OpdPbjItem[];
    summary: OpdPbjSummary | null;
    loading: boolean;
    error: Error | null;
    retry: () => void;
}

/**
 * Normalisasi nilai paket berdasarkan jenis transaksi.
 */
function getNilai(item: PbjDetailItem, jenis: PbjJenisTransaksi): number {
    if (jenis === "CATALOG") return item.total ?? item.total_harga ?? 0;
    return item.pagu ?? item.nilai_kontrak ?? 0;
}

/**
 * Cek apakah nama_satker dari item cocok dengan namaOpd (case-insensitive, partial match).
 */
function matchSatker(item: PbjDetailItem, namaOpd: string): boolean {
    const satker = (item.nama_satker ?? "").toLowerCase().trim();
    const opd = namaOpd.toLowerCase().trim();
    // Coba keduanya: exact match, atau salah satu mengandung yang lain
    return satker === opd || satker.includes(opd) || opd.includes(satker);
}

export function useOpdPbj(namaOpd: string, tahun: number, initialData?: any[]): UseOpdPbjResult {
    const [catalog, setCatalog] = useState<PbjDetailItem[]>(initialData?.filter((i: any) => i.jenis_transaksi === "CATALOG") || []);
    const [tender, setTender] = useState<PbjDetailItem[]>(initialData?.filter((i: any) => i.jenis_transaksi === "TENDER") || []);
    const [nonTender, setNonTender] = useState<PbjDetailItem[]>(initialData?.filter((i: any) => i.jenis_transaksi === "NON-TENDER") || []);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<Error | null>(null);
    const firstRenderRef = useRef(true);

    const fetchAll = useCallback(async () => {
        if (!namaOpd) return;
        setLoading(true);
        setError(null);

        try {
            const [cat, ten, nonTen] = await Promise.all([
                pbjCatalogService.fetchList(tahun),
                pbjTenderService.fetchList(tahun),
                pbjNonTenderService.fetchList(tahun),
            ]);
            setCatalog(cat);
            setTender(ten);
            setNonTender(nonTen);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Gagal memuat data PBJ"));
        } finally {
            setLoading(false);
        }
    }, [namaOpd, tahun]);

    useEffect(() => {
        if (firstRenderRef.current && initialData) {
            firstRenderRef.current = false;
            return;
        }
        fetchAll();
        firstRenderRef.current = false;
    }, [fetchAll, initialData]);

    const { data, summary } = useMemo(() => {
        const filtered: OpdPbjItem[] = [
            ...catalog.filter(i => matchSatker(i, namaOpd)).map(i => ({ ...i, jenis_transaksi: "CATALOG" as PbjJenisTransaksi })),
            ...tender.filter(i => matchSatker(i, namaOpd)).map(i => ({ ...i, jenis_transaksi: "TENDER" as PbjJenisTransaksi })),
            ...nonTender.filter(i => matchSatker(i, namaOpd)).map(i => ({ ...i, jenis_transaksi: "NON-TENDER" as PbjJenisTransaksi })),
        ];

        if (filtered.length === 0) return { data: filtered, summary: null };

        const byJenis: Record<PbjJenisTransaksi, { count: number; nilai: number }> = {
            CATALOG: { count: 0, nilai: 0 },
            TENDER: { count: 0, nilai: 0 },
            "NON-TENDER": { count: 0, nilai: 0 },
        };

        let totalNilai = 0;
        for (const item of filtered) {
            const nilai = getNilai(item, item.jenis_transaksi);
            byJenis[item.jenis_transaksi].count++;
            byJenis[item.jenis_transaksi].nilai += nilai;
            totalNilai += nilai;
        }

        return {
            data: filtered,
            summary: {
                total: filtered.length,
                totalNilai,
                byJenis,
            },
        };
    }, [catalog, tender, nonTender, namaOpd]);

    return { data, summary, loading, error, retry: fetchAll };
}

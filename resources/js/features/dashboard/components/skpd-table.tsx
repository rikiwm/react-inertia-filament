/**
 * @file Components/Dashboard/skpd-table.tsx
 *
 * Komponen tabel reusable untuk menampilkan breakdown SKPD
 * (Belanja Daerah atau Pendapatan Daerah).
 */

import { cn } from "@/Lib/utils";
import { Table } from "@/shared/components/ui/table";
import { memo, useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import { motion } from 'motion/react';
import { fmtNumber } from "@/Lib/formatters";
import { createOpdSlug } from "@/Lib/utils";

/** 
 * Local Rupiah formatter for full currency display.
 * Using fmtNumberFull from Lib/formatters or a local one if needed.
 */

export type SortField = "nama_opd" | "pagu" | "realisasi" | "persentase" | "pagu_pad" | "realisasi_pad" | "persentase_pad";
export type SortDirection = "asc" | "desc" | null;

interface SortConfig {
    field: SortField | null;
    direction: SortDirection;
}

interface SkpdTableProps {
    /** Array SKPD data untuk ditampilkan. */
    data: any[];
    /** Tipe data: 'belanja' (belanja daerah) atau 'pendapatan' (pendapatan daerah). */
    type: "belanja" | "pendapatan";
    /** Menunjukkan loading state pada tabel. */
    loading?: boolean;
    /** Error message jika terjadi kesalahan saat fetch data. */
    error?: Error | null;
    /** Tahun anggaran saat ini. */
    tahun?: number;
}

/**
 * Loading skeleton untuk SkpdTable.
 */
const SkpdTableSkeleton = memo(function SkpdTableSkeleton() {
    return (
        <div className="space-y-3 w-full">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse" />
            ))}
        </div>
    );
});

/**
 * Komponen tabel SKPD dengan sorting, formatting, dan responsive design.
 */
const SkpdTable = memo(function SkpdTable({
    data,
    type = "belanja",
    loading = false,
    error = null,
    tahun = new Date().getFullYear(),
}: SkpdTableProps) {
    const [sort, setSort] = useState<SortConfig>({ field: null, direction: null });

    const headers =
        type === "belanja"
            ? [
                { key: "nama_opd", label: "Nama OPD", sortable: true },
                { key: "pagu", label: "Anggaran", sortable: true, align: "right" as const },
                { key: "realisasi", label: "Realisasi", sortable: true, align: "right" as const },
                { key: "sisa", label: "Sisa", sortable: false, align: "right" as const },
                { key: "persentase_anggaran", label: "Realisasi %", sortable: true, align: "right" as const },
            ]
            : [
                { key: "nama_opd", label: "Nama OPD", sortable: true },
                { key: "pagu_pad", label: "Target PAD", sortable: true, align: "right" as const },
                { key: "realisasi_pad", label: "Realisasi PAD", sortable: true, align: "right" as const },
                { key: "sisa_pad", label: "Sisa", sortable: false, align: "right" as const },
                { key: "persentase_pad", label: "Realisasi %", sortable: true, align: "right" as const },
            ];

    const handleSort = (field: SortField) => {
        setSort((prev) => {
            if (prev.field === field) {
                if (prev.direction === "asc") return { field, direction: "desc" };
                if (prev.direction === "desc") return { field: null, direction: null };
            }
            return { field, direction: "asc" };
        });
    };

    const sortedData = useMemo(() => {
        if (!sort.field || !data) return data;
        return [...data].sort((a, b) => {
            const aVal = a[sort.field!];
            const bVal = b[sort.field!];
            if (aVal == null || bVal == null) return 0;
            if (typeof aVal === "number" && typeof bVal === "number") {
                return sort.direction === "asc" ? aVal - bVal : bVal - aVal;
            }
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();
            return sort.direction === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
        });
    }, [data, sort]);

    if (loading) return <SkpdTableSkeleton />;

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-4">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Gagal memuat data: {error.message}
                </p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-8 text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Tidak ada data yang ditemukan</p>
            </div>
        );
    }

    const getSortIcon = (field: string) => {
        if (sort.field !== field) return "↕️";
        return sort.direction === "asc" ? "↑" : "↓";
    };

    const handleRowClick = (item: any) => {
        const opdSlug = createOpdSlug(item.nama_opd);
        const routeType = type === "belanja" ? "belanja" : "pendapatan";
        router.get(`/dashboard/${routeType}/${opdSlug}?tahun=${tahun}`);
    }

    return (
        <div className="w-full overflow-x-auto p-2">
            <Table striped stickyHeader>
                <Table.Head>
                    <Table.Tr>
                        {headers.map((header) => (
                            <Table.Th
                                key={header.key}
                                onClick={() => header.sortable && handleSort(header.key as SortField)}
                                className={cn(
                                    "relative border-b border-neutral-200 dark:border-neutral-700",
                                    header.align === "right" && "text-right",
                                    header.sortable && "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                )}
                            >
                                <div className={cn("flex items-center gap-2 font-semibold text-neutral-700 dark:text-neutral-300", header.align === "right" && "justify-end")}>
                                    <span>{header.label}</span>
                                    {header.sortable && <span className="text-xs opacity-60">{getSortIcon(header.key)}</span>}
                                </div>
                            </Table.Th>
                        ))}
                    </Table.Tr>
                </Table.Head>
                <Table.Body>
                    {sortedData.map((item, idx) => (
                        <motion.tr
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: idx * 0.02 }}
                            key={`${item.kd_unit}-${idx}`}
                            onClick={() => handleRowClick(item)}
                            className="hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                            {type === "belanja" ? (
                                <>
                                    <Table.Td className="text-neutral-800 dark:text-neutral-200 text-sm">
                                        <div>
                                            <span className="font-semibold text-xs lg:text-sm text-teal-950 dark:text-neutral-400">{item.nama_opd}</span>
                                            <p className="text-[8px] lg:text-xs text-teal-500 text-light dark:text-neutral-400">{item.kd_unit}</p>
                                        </div>
                                    </Table.Td>
                                    <Table.Td className="text-right text-neutral-700 dark:text-neutral-400 text-xs lg:text-sm">{fmtNumber(item.pagu)}</Table.Td>
                                    <Table.Td className="text-right text-neutral-700 dark:text-neutral-400 text-xs lg:text-sm font-medium">{fmtNumber(item.realisasi)}</Table.Td>
                                    <Table.Td className="text-right text-neutral-700 dark:text-neutral-400 text-xs lg:text-sm">{fmtNumber(item.sisa)}</Table.Td>
                                    <Table.Td className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-12 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-teal-500 dark:bg-teal-400 rounded-full transition-all" style={{ width: `${Math.min(item.persentase_anggaran, 100)}%` }} />
                                            </div>
                                            <span className="text-xs lg:text-sm  font-semibold text-neutral-700 dark:text-neutral-300 w-12 text-right tabular-nums">{item.persentase_anggaran.toFixed(1)}%</span>
                                        </div>
                                    </Table.Td>
                                </>
                            ) : (
                                <>
                                    <Table.Td className="font-medium text-neutral-800 dark:text-neutral-200 text-sm">
                                        <div>
                                            <span className="font-semibold text-xs lg:text-sm text-teal-950 dark:text-neutral-400">{item.nama_opd}</span>
                                            <p className="text-[8px] lg:text-xs text-teal-500 text-light dark:text-neutral-400">{item.kd_unit}</p>
                                        </div>
                                    </Table.Td>
                                    <Table.Td className="text-right text-neutral-700 dark:text-neutral-400 text-xs lg:text-sm">{fmtNumber(item.pagu_pad)}</Table.Td>
                                    <Table.Td className="text-right text-neutral-700 dark:text-neutral-400 text-xs lg:text-sm font-medium">{fmtNumber(item.realisasi_pad)}</Table.Td>
                                    <Table.Td className="text-right text-neutral-700 dark:text-neutral-400 text-xs lg:text-sm">{fmtNumber(item.sisa_pad)}</Table.Td>
                                    <Table.Td className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-12 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-teal-500 dark:bg-teal-400 rounded-full transition-all" style={{ width: `${Math.min(item.persentase_pad, 100)}%` }} />
                                            </div>
                                            <span className="text-xs lg:text-sm  font-semibold text-neutral-700 dark:text-neutral-300 w-12 text-right tabular-nums">{item.persentase_pad.toFixed(1)}%</span>
                                        </div>
                                    </Table.Td>
                                </>
                            )}
                        </motion.tr>
                    ))}
                </Table.Body>
            </Table>
        </div>
    );
});

SkpdTable.displayName = "SkpdTable";

export { SkpdTable };

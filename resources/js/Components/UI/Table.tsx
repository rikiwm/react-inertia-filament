/**
 * @file Components/UI/Table.tsx
 *
 * Komponen tabel reusable dengan API compound-component.
 *
 * Fitur:
 * - Compound component (Table, Thead, Tbody, Tr, Th, Td)
 * - Sortable columns dengan indikator arah sort
 * - Striped rows opsional
 * - Sticky header opsional
 * - Skeleton loading state
 * - Empty state dengan ilustrasi
 * - Responsive: horizontal scroll otomatis di mobile
 * - Full dark mode support (palet sky/neutral sesuai tema project)
 */

import { cn } from "@/Lib/Utils";
import { memo, type ReactNode, type ThHTMLAttributes, type TdHTMLAttributes, createContext, useContext } from "react";

// ─── Tipe ────────────────────────────────────────────────────────────────────

/** Arah pengurutan kolom. */
export type SortDirection = "asc" | "desc" | null;

/** Konteks untuk membagikan opsi ke semua sub-komponen. */
interface TableContextValue {
    /** Jika true, baris bergantian mendapat background berbeda. */
    striped: boolean;
    /** Jika true, header tabel mengikuti scroll halaman vertikal. */
    stickyHeader: boolean;
}

// ─── Konteks Internal ────────────────────────────────────────────────────────

const TableContext = createContext<TableContextValue>({
    striped: false,
    stickyHeader: false,
});

// ─── Table (Root) ─────────────────────────────────────────────────────────────

interface TableProps {
    /** Konten tabel (Thead + Tbody). */
    children: ReactNode;
    /** Jika true, baris bergantian mendapat latar sedikit berbeda. */
    striped?: boolean;
    /** Jika true, header mengikuti scroll vertikal (sticky). */
    stickyHeader?: boolean;
    /** Class tambahan untuk wrapper luar (overflow container). */
    className?: string;
    /** Label aksesibilitas untuk screen reader. */
    caption?: string;
}

/**
 * Komponen tabel root yang membungkus seluruh struktur tabel.
 *
 * Menyediakan konteks untuk `striped` dan `stickyHeader` ke semua
 * sub-komponen turunan. Wrapper luar menangani horizontal scroll
 * secara otomatis agar tabel responsif di layar kecil.
 *
 * @param striped      - Aktifkan warna bergantian pada baris
 * @param stickyHeader - Buat header menempel saat scroll
 * @param caption      - Label tabel untuk aksesibilitas (tersembunyi secara visual)
 * @param className    - Class tambahan untuk container
 *
 * @example
 * <Table striped stickyHeader>
 *   <Table.Head>
 *     <Table.Tr>
 *       <Table.Th sortable sortDir="asc" onSort={() => {}}>Nama</Table.Th>
 *       <Table.Th>Email</Table.Th>
 *     </Table.Tr>
 *   </Table.Head>
 *   <Table.Body>
 *     <Table.Tr>
 *       <Table.Td>Budi</Table.Td>
 *       <Table.Td>budi@example.com</Table.Td>
 *     </Table.Tr>
 *   </Table.Body>
 * </Table>
 */
const Root = memo(function Table({
    children,
    striped = false,
    stickyHeader = false,
    className,
    caption,
}: TableProps) {
    return (
        <TableContext.Provider value={{ striped, stickyHeader }}>
            <div
                className={cn(
                    "w-full overflow-x-auto",
                    "rounded-2xl",
                    "border border-neutral-200 dark:border-neutral-800",
                    "shadow-sm",
                    className,
                )}
            >
                <table className="w-full border-collapse text-sm">
                    {caption && (
                        <caption className="sr-only">{caption}</caption>
                    )}
                    {children}
                </table>
            </div>
        </TableContext.Provider>
    );
});

// ─── Table.Head ───────────────────────────────────────────────────────────────

interface TheadProps {
    /** Baris header (satu atau lebih Table.Tr). */
    children: ReactNode;
    /** Class tambahan untuk elemen `<thead>`. */
    className?: string;
}

/**
 * Bagian header tabel (`<thead>`).
 *
 * Menerapkan background yang berbeda dari body dan mendapat posisi
 * `sticky top-0` jika opsi `stickyHeader` diaktifkan di komponen root.
 */
const Head = memo(function Thead({ children, className }: TheadProps) {
    const { stickyHeader } = useContext(TableContext);
    return (
        <thead
            className={cn(
                "bg-neutral-50 dark:bg-neutral-900",
                "border-b border-neutral-200 dark:border-neutral-800",
                stickyHeader && "sticky top-0 z-10",
                className,
            )}
        >
            {children}
        </thead>
    );
});

// ─── Table.Body ───────────────────────────────────────────────────────────────

interface TbodyProps {
    /** Baris-baris data (satu atau lebih Table.Tr). */
    children: ReactNode;
    /** Class tambahan untuk elemen `<tbody>`. */
    className?: string;
}

/**
 * Bagian tubuh tabel (`<tbody>`) yang menampung baris-baris data.
 *
 * Membaca konteks `striped` untuk meneruskan ke Tr melalui CSS selector
 * `:nth-child(even)` menggunakan class Tailwind `divide-y`.
 */
const Body = memo(function Tbody({ children, className }: TbodyProps) {
    return (
        <tbody
            className={cn(
                "divide-y divide-neutral-100 dark:divide-neutral-800",
                "bg-white dark:bg-neutral-950",
                className,
            )}
        >
            {children}
        </tbody>
    );
});

// ─── Table.Tr ─────────────────────────────────────────────────────────────────

interface TrProps {
    /** Sel-sel dalam baris ini (Table.Th atau Table.Td). */
    children: ReactNode;
    /** Class tambahan untuk elemen `<tr>`. */
    className?: string;
    /** Jika true, baris ini mendapat index stripe genap secara manual. */
    isEven?: boolean;
    /** Handler klik opsional untuk baris yang bisa diklik. */
    onClick?: () => void;
}

/**
 * Baris tabel (`<tr>`).
 *
 * Mendukung efek hover dan striping manual (`isEven`).
 * Jika `onClick` diberikan, kursor berubah menjadi pointer.
 */
const Tr = memo(function Tr({ children, className, isEven = false, onClick }: TrProps) {
    const { striped } = useContext(TableContext);
    return (
        <tr
            onClick={onClick}
            className={cn(
                "transition-colors duration-150",
                "hover:bg-sky-50/60 dark:hover:bg-sky-950/20",
                striped && isEven && "bg-neutral-50/70 dark:bg-neutral-900/40",
                onClick && "cursor-pointer",
                className,
            )}
        >
            {children}
        </tr>
    );
});

// ─── Table.Th ─────────────────────────────────────────────────────────────────

interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
    /** Konten header kolom. */
    children: ReactNode;
    /** Jika true, kolom ini bisa diurutkan dan menampilkan indikator sort. */
    sortable?: boolean;
    /** Arah pengurutan saat ini untuk kolom ini. */
    sortDir?: SortDirection;
    /** Callback saat header diklik untuk mengubah urutan pengurutan. */
    onSort?: () => void;
    /** Rata kanan konten kolom (berguna untuk kolom angka). */
    align?: "left" | "center" | "right";
}

/**
 * Sel header tabel (`<th>`).
 *
 * Mendukung klik untuk pengurutan jika `sortable={true}`. Indikator arah
 * (↑ / ↓) ditampilkan di samping konten saat kolom sedang diurutkan.
 *
 * @param sortable - Aktifkan fitur sort pada kolom ini
 * @param sortDir  - Arah sort aktif ("asc" | "desc" | null)
 * @param onSort   - Callback yang dipanggil saat header diklik
 * @param align    - Rata konten kolom (kiri/tengah/kanan)
 */
const Th = memo(function Th({
    children,
    sortable = false,
    sortDir = null,
    onSort,
    align = "left",
    className,
    ...rest
}: ThProps) {
    const alignClass = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
    }[align];

    return (
        <th
            {...rest}
            onClick={sortable ? onSort : undefined}
            className={cn(
                "px-4 py-3.5",
                "text-xs font-semibold uppercase tracking-wider",
                "text-neutral-500 dark:text-neutral-400",
                "select-none whitespace-nowrap",
                alignClass,
                sortable && "cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition-colors",
                className,
            )}
        >
            <span className="inline-flex items-center gap-1.5">
                {children}
                {/* Indikator arah sort */}
                {sortable && (
                    <span
                        className={cn(
                            "transition-all duration-200",
                            sortDir
                                ? "text-sky-500 dark:text-sky-400 opacity-100"
                                : "text-neutral-300 dark:text-neutral-600 opacity-50",
                        )}
                    >
                        {sortDir === "asc" ? (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                            </svg>
                        ) : sortDir === "desc" ? (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4M8 15l4 4 4-4" />
                            </svg>
                        )}
                    </span>
                )}
            </span>
        </th>
    );
});

// ─── Table.Td ─────────────────────────────────────────────────────────────────

interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
    /** Konten sel data. */
    children: ReactNode;
    /** Warna aksen opsional untuk sel tertentu. */
    variant?: "default" | "success" | "warning" | "danger" | "info";
    /** Rata kanan konten sel (berguna untuk kolom angka). */
    align?: "left" | "center" | "right";
    /** Jika true, konten tidak akan terpotong (no-wrap). */
    noWrap?: boolean;
}

/** Peta warna variant ke class Tailwind yang sesuai. */
const TD_VARIANT_CLASSES: Record<NonNullable<TdProps["variant"]>, string> = {
    default: "text-neutral-700 dark:text-neutral-300",
    success: "text-emerald-600 dark:text-emerald-400 font-medium",
    warning: "text-amber-600 dark:text-amber-400 font-medium",
    danger:  "text-red-600 dark:text-red-400 font-medium",
    info:    "text-sky-600 dark:text-sky-400 font-medium",
};

/**
 * Sel data tabel (`<td>`).
 *
 * Mendukung pewarnaan konten melalui prop `variant` untuk menyoroti
 * status (sukses, peringatan, bahaya, info). Mempertahankan semua
 * atribut HTML standar `<td>` melalui spread props.
 *
 * @param variant - Warna aksen konten sel
 * @param align   - Rata konten sel (kiri/tengah/kanan)
 * @param noWrap  - Cegah konten terpotong ke baris baru
 */
const Td = memo(function Td({
    children,
    variant = "default",
    align = "left",
    noWrap = false,
    className,
    ...rest
}: TdProps) {
    const alignClass = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
    }[align];

    return (
        <td
            {...rest}
            className={cn(
                "px-4 py-3.5 text-sm",
                TD_VARIANT_CLASSES[variant],
                alignClass,
                noWrap && "whitespace-nowrap",
                className,
            )}
        >
            {children}
        </td>
    );
});

// ─── Table.Skeleton ───────────────────────────────────────────────────────────

interface SkeletonProps {
    /** Jumlah baris skeleton yang ditampilkan. */
    rows?: number;
    /** Jumlah kolom skeleton yang ditampilkan. */
    cols?: number;
}

/**
 * Placeholder loading untuk tabel saat data sedang dimuat.
 *
 * Merender animasi skeleton sesuai jumlah baris dan kolom yang
 * diperkirakan, sehingga layout halaman tidak bergeser saat data tiba.
 *
 * @param rows - Jumlah baris placeholder (default 5)
 * @param cols - Jumlah kolom placeholder (default 4)
 */
const Skeleton = memo(function TableSkeleton({ rows = 5, cols = 4 }: SkeletonProps) {
    return (
        <div className="w-full overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm animate-pulse">
            <table className="w-full border-collapse text-sm">
                {/* Skeleton header */}
                <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                    <tr>
                        {Array.from({ length: cols }).map((_, i) => (
                            <th key={i} className="px-4 py-3.5">
                                <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-700"
                                     style={{ width: `${50 + Math.random() * 40}%` }} />
                            </th>
                        ))}
                    </tr>
                </thead>
                {/* Skeleton rows */}
                <tbody className="bg-white dark:bg-neutral-950 divide-y divide-neutral-100 dark:divide-neutral-800">
                    {Array.from({ length: rows }).map((_, ri) => (
                        <tr key={ri}>
                            {Array.from({ length: cols }).map((_, ci) => (
                                <td key={ci} className="px-4 py-3.5">
                                    <div className="h-3 rounded-full bg-neutral-100 dark:bg-neutral-800"
                                         style={{ width: `${40 + Math.random() * 50}%` }} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

// ─── Table.Empty ──────────────────────────────────────────────────────────────

interface EmptyProps {
    /** Pesan utama yang ditampilkan. */
    title?: string;
    /** Deskripsi tambahan di bawah judul. */
    description?: string;
    /** Elemen aksi opsional (tombol, tautan, dll). */
    action?: ReactNode;
}

/**
 * State kosong yang ditampilkan saat tabel tidak memiliki data.
 *
 * Merender ilustrasi sederhana, judul, deskripsi, dan slot untuk
 * tombol aksi (misalnya "Tambah Data Baru").
 *
 * @param title       - Judul pesan kosong (default: "Tidak ada data")
 * @param description - Penjelasan singkat mengapa tabel kosong
 * @param action      - Elemen aksi opsional
 */
const Empty = memo(function TableEmpty({
    title = "Tidak ada data",
    description = "Belum ada data yang tersedia untuk ditampilkan.",
    action,
}: EmptyProps) {
    return (
        <div className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-950">
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                {/* Ilustrasi */}
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-neutral-400 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M3 10h18M3 14h18M10 3v18M14 3v18" />
                    </svg>
                </div>
                <p className="text-neutral-800 dark:text-neutral-200 font-semibold text-base mb-1">{title}</p>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-xs">{description}</p>
                {action && <div className="mt-6">{action}</div>}
            </div>
        </div>
    );
});

// ─── Table.Badge ──────────────────────────────────────────────────────────────

interface BadgeProps {
    /** Teks yang ditampilkan di dalam badge. */
    children: ReactNode;
    /** Variasi warna badge. */
    variant?: "default" | "success" | "warning" | "danger" | "info";
}

/** Peta warna badge ke class Tailwind. */
const BADGE_VARIANT_CLASSES: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
    success: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800",
    warning: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800",
    danger:  "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800",
    info:    "bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-800",
};

/**
 * Komponen badge mini untuk digunakan di dalam sel tabel.
 *
 * Berguna untuk menampilkan status, peran, atau kategori secara visual
 * dengan warna yang konsisten. Dapat dipakai di dalam `Table.Td`.
 *
 * @param variant - Variasi warna badge
 *
 * @example
 * <Table.Td>
 *   <Table.Badge variant="success">Aktif</Table.Badge>
 * </Table.Td>
 */
const Badge = memo(function TableBadge({ children, variant = "default" }: BadgeProps) {
    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            BADGE_VARIANT_CLASSES[variant],
        )}>
            {children}
        </span>
    );
});

// ─── Ekspor Compound Component ─────────────────────────────────────────────────

/**
 * Komponen tabel dengan API compound-component.
 *
 * Subkomponen yang tersedia:
 * - `Table.Head`    — Wrapper `<thead>`
 * - `Table.Body`    — Wrapper `<tbody>`
 * - `Table.Tr`      — Baris tabel
 * - `Table.Th`      — Sel header (mendukung sorting)
 * - `Table.Td`      — Sel data (mendukung variant warna)
 * - `Table.Skeleton`— Loading placeholder
 * - `Table.Empty`   — State kosong
 * - `Table.Badge`   — Badge status untuk di dalam sel
 */
export const Table = Object.assign(Root, {
    Head:     Head,
    Body:     Body,
    Tr:       Tr,
    Th:       Th,
    Td:       Td,
    Skeleton: Skeleton,
    Empty:    Empty,
    Badge:    Badge,
});

export default Table;

/**
 * @file Pages/TableDemo.tsx
 *
 * Halaman demonstrasi komponen Table untuk melihat semua fitur sekaligus.
 * Hapus halaman ini (dan route-nya) setelah pengembangan selesai.
 */

import { Table } from "@/Components/UI/Table";
import { cn } from "@/Lib/Utils";
import FrontWrapper from "@/Wrappers/FrontWrapper";
import { type ReactNode, useState } from "react";

// ─── Data Contoh ─────────────────────────────────────────────────────────────

interface Employee {
    id: number;
    name: string;
    email: string;
    department: string;
    role: string;
    status: "active" | "inactive" | "pending";
    salary: number;
    joinDate: string;
}

const DEMO_DATA: Employee[] = [
    { id: 1,  name: "Budi Santoso",    email: "budi@example.com",    department: "Engineering",  role: "Senior Dev",    status: "active",   salary: 18_000_000, joinDate: "2021-03-15" },
    { id: 2,  name: "Siti Rahayu",     email: "siti@example.com",    department: "Design",       role: "UI/UX Lead",    status: "active",   salary: 15_000_000, joinDate: "2022-01-08" },
    { id: 3,  name: "Ahmad Fauzi",     email: "ahmad@example.com",   department: "Engineering",  role: "Backend Dev",   status: "pending",  salary: 12_000_000, joinDate: "2023-06-20" },
    { id: 4,  name: "Maya Putri",      email: "maya@example.com",    department: "Marketing",    role: "Content Lead",  status: "active",   salary: 11_500_000, joinDate: "2022-09-01" },
    { id: 5,  name: "Rizki Pratama",   email: "rizki@example.com",   department: "Engineering",  role: "DevOps",        status: "inactive", salary: 14_000_000, joinDate: "2020-11-30" },
    { id: 6,  name: "Dewi Anggraini",  email: "dewi@example.com",    department: "HR",           role: "HR Manager",    status: "active",   salary: 13_000_000, joinDate: "2021-07-14" },
    { id: 7,  name: "Fajar Nugraha",   email: "fajar@example.com",   department: "Finance",      role: "Analyst",       status: "active",   salary: 12_500_000, joinDate: "2022-04-22" },
    { id: 8,  name: "Laila Nuraini",   email: "laila@example.com",   department: "Design",       role: "Graphic Design",status: "pending",  salary: 10_000_000, joinDate: "2024-01-03" },
];

type SortKey = keyof Employee;
type SortDir = "asc" | "desc" | null;

/** Format angka ke format mata uang Rupiah. */
const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

/** Format tanggal ISO ke format lokal Indonesia. */
const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

// ─── Peta Status ke Variant Badge ────────────────────────────────────────────

const STATUS_VARIANT = {
    active:   "success",
    inactive: "danger",
    pending:  "warning",
} as const;

const STATUS_LABEL = {
    active:   "Aktif",
    inactive: "Tidak Aktif",
    pending:  "Menunggu",
} as const;

// ─── Komponen Demo ────────────────────────────────────────────────────────────

const TableDemo = () => {
    const [sortKey, setSortKey]   = useState<SortKey | null>(null);
    const [sortDir, setSortDir]   = useState<SortDir>(null);
    const [isLoading, setLoading] = useState(false);
    const [search, setSearch]     = useState("");

    /**
     * Mengubah kunci dan arah pengurutan saat header kolom diklik.
     * Siklus: null → asc → desc → null
     */
    const handleSort = (key: SortKey) => {
        if (sortKey !== key) {
            setSortKey(key);
            setSortDir("asc");
        } else if (sortDir === "asc") {
            setSortDir("desc");
        } else {
            setSortKey(null);
            setSortDir(null);
        }
    };

    /** Mendapatkan arah sort aktif untuk kolom tertentu. */
    const getSortDir = (key: SortKey): SortDir =>
        sortKey === key ? sortDir : null;

    /** Data yang sudah difilter dan diurutkan. */
    const displayData = [...DEMO_DATA]
        .filter((e) => {
            const q = search.toLowerCase();
            return (
                !q ||
                e.name.toLowerCase().includes(q) ||
                e.email.toLowerCase().includes(q) ||
                e.department.toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            if (!sortKey || !sortDir) return 0;
            const va = a[sortKey];
            const vb = b[sortKey];
            const cmp = va < vb ? -1 : va > vb ? 1 : 0;
            return sortDir === "asc" ? cmp : -cmp;
        });

    return (
        <div className="min-h-screen w-full pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-0 py-12 space-y-16">

                {/* ── Judul ── */}
                <div>
                    <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-2">
                        Table Component{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-sky-700">
                            Demo
                        </span>
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Semua varian dan fitur komponen <code className="font-mono text-sky-600 dark:text-sky-400">{"<Table />"}</code> ditampilkan di sini.
                    </p>
                </div>

                {/* ── Section 1: Tabel Lengkap ── */}
                <section>
                    <SectionTitle>1. Tabel Lengkap — Sortable, Striped, Sticky Header</SectionTitle>

                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Cari nama, email, departemen..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={cn(
                                "w-full sm:max-w-xs px-4 py-2 rounded-xl text-sm",
                                "border border-neutral-200 dark:border-neutral-700",
                                "bg-white dark:bg-neutral-900",
                                "text-neutral-800 dark:text-neutral-200",
                                "placeholder:text-neutral-400",
                                "focus:outline-none focus:ring-2 focus:ring-sky-500/40",
                                "transition-all",
                            )}
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-neutral-500 text-sm">
                                {displayData.length} dari {DEMO_DATA.length} karyawan
                            </span>
                            <button
                                onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}
                                className="px-4 py-2 rounded-xl text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white transition-colors"
                            >
                                Simulasi Loading
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <Table.Skeleton rows={6} cols={7} />
                    ) : displayData.length === 0 ? (
                        <Table.Empty
                            title="Karyawan tidak ditemukan"
                            description={`Tidak ada karyawan yang cocok dengan kata kunci "${search}".`}
                            action={
                                <button
                                    onClick={() => setSearch("")}
                                    className="px-4 py-2 rounded-xl text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white transition-colors"
                                >
                                    Reset Pencarian
                                </button>
                            }
                        />
                    ) : (
                        <Table striped stickyHeader caption="Daftar karyawan">
                            <Table.Head>
                                <Table.Tr>
                                    <Table.Th sortable sortDir={getSortDir("id")} onSort={() => handleSort("id")} className="w-14">
                                        #
                                    </Table.Th>
                                    <Table.Th sortable sortDir={getSortDir("name")} onSort={() => handleSort("name")}>
                                        Nama
                                    </Table.Th>
                                    <Table.Th sortable sortDir={getSortDir("department")} onSort={() => handleSort("department")}>
                                        Departemen
                                    </Table.Th>
                                    <Table.Th>Peran</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th sortable sortDir={getSortDir("salary")} onSort={() => handleSort("salary")} align="right">
                                        Gaji
                                    </Table.Th>
                                    <Table.Th sortable sortDir={getSortDir("joinDate")} onSort={() => handleSort("joinDate")} align="right">
                                        Bergabung
                                    </Table.Th>
                                </Table.Tr>
                            </Table.Head>
                            <Table.Body>
                                {displayData.map((emp, i) => (
                                    <Table.Tr
                                        key={emp.id}
                                        isEven={i % 2 === 1}
                                        onClick={() => alert(`Klik: ${emp.name}`)}
                                    >
                                        <Table.Td noWrap className="text-neutral-400 font-mono text-xs">
                                            {emp.id}
                                        </Table.Td>
                                        <Table.Td noWrap>
                                            <div>
                                                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{emp.name}</p>
                                                <p className="text-neutral-400 text-xs">{emp.email}</p>
                                            </div>
                                        </Table.Td>
                                        <Table.Td noWrap variant="info">{emp.department}</Table.Td>
                                        <Table.Td noWrap>{emp.role}</Table.Td>
                                        <Table.Td noWrap>
                                            <Table.Badge variant={STATUS_VARIANT[emp.status]}>
                                                {STATUS_LABEL[emp.status]}
                                            </Table.Badge>
                                        </Table.Td>
                                        <Table.Td noWrap align="right" variant="success">
                                            {formatRupiah(emp.salary)}
                                        </Table.Td>
                                        <Table.Td noWrap align="right">
                                            {formatDate(emp.joinDate)}
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Body>
                        </Table>
                    )}
                </section>

                {/* ── Section 2: Skeleton Loading ── */}
                <section>
                    <SectionTitle>2. Skeleton Loading State</SectionTitle>
                    <Table.Skeleton rows={4} cols={5} />
                </section>

                {/* ── Section 3: Empty State ── */}
                <section>
                    <SectionTitle>3. Empty State</SectionTitle>
                    <Table.Empty
                        title="Belum ada transaksi"
                        description="Buat transaksi pertama untuk mulai melacak data keuangan Anda."
                        action={
                            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-colors shadow-md shadow-sky-200 dark:shadow-sky-900/40">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Buat Transaksi
                            </button>
                        }
                    />
                </section>

                {/* ── Section 4: Varian Td ── */}
                <section>
                    <SectionTitle>4. Varian Warna Td & Badge</SectionTitle>
                    <Table>
                        <Table.Head>
                            <Table.Tr>
                                <Table.Th>Variant</Table.Th>
                                <Table.Th>Td Text</Table.Th>
                                <Table.Th>Badge</Table.Th>
                                <Table.Th>Keterangan</Table.Th>
                            </Table.Tr>
                        </Table.Head>
                        <Table.Body>
                            {(["default", "success", "warning", "danger", "info"] as const).map((v, i) => (
                                <Table.Tr key={v} isEven={i % 2 === 1}>
                                    <Table.Td noWrap>
                                        <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                                            variant="{v}"
                                        </code>
                                    </Table.Td>
                                    <Table.Td variant={v}>Teks dengan warna {v}</Table.Td>
                                    <Table.Td>
                                        <Table.Badge variant={v}>{v}</Table.Badge>
                                    </Table.Td>
                                    <Table.Td className="text-neutral-500">
                                        {{
                                            default: "Teks standar",
                                            success: "Operasi berhasil",
                                            warning: "Perlu perhatian",
                                            danger:  "Error / bahaya",
                                            info:    "Informasi umum",
                                        }[v]}
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Body>
                    </Table>
                </section>

            </div>
        </div>
    );
};

/** Helper judul section untuk halaman demo. */
const SectionTitle = ({ children }: { children: ReactNode }) => (
    <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-3">
        <span className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
        {children}
        <span className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
    </h2>
);

TableDemo.layout = (page: ReactNode) => <FrontWrapper title="Table Demo">{page}</FrontWrapper>;

export default TableDemo;

/**
 * @file Constants/dashboard.ts
 *
 * Data, konstanta, dan tipe untuk halaman dashboard statistik publik.
 * Seluruh dummy data di-generate secara deterministik agar tampilan konsisten.
 */

// ─── Tipe ────────────────────────────────────────────────────────────────────

/** Periode waktu yang tersedia sebagai filter. */
export type TimeRange = "1D" | "7D" | "1M" | "3M" | "1Y";

/** Satu titik data pada grafik time-series. */
export interface ChartPoint {
    /** Label waktu (jam, tanggal, bulan, dll.) yang ditampilkan di sumbu X. */
    label: string;
    /** Nilai metrik utama (harga, pendapatan, dsb.). */
    value: number;
    /** Nilai metrik pembanding opsional (volume, target, dsb.). */
    volume?: number;
    /** Nilai prediksi/target opsional untuk garis referensi. */
    target?: number;
}

/** Satu kartu KPI pada bagian atas dashboard. */
export interface KpiCard {
    /** Pengenal unik untuk kartu. */
    id: string;
    /** Label kartu yang ditampilkan ke pengguna. */
    label: string;
    /** Nilai saat ini (sudah diformat sebagai string). */
    value: string;
    /** Nilai numerik mentah untuk perhitungan internal. */
    rawValue: number;
    /** Persentase perubahan dari periode sebelumnya. */
    change: number;
    /** Sub-teks keterangan tambahan. */
    subtitle: string;
    /** Nama ikon (untuk switch-case di komponen). */
    icon: "revenue" | "users" | "transactions" | "profit" | "volume" | "ratio";
    /** Warna aksen kartu. */
    color: "sky" | "emerald" | "violet" | "amber" | "rose";
    /** Data sparkline mini untuk kartu. */
    spark: number[];
}

/** Satu baris pada tabel transaksi terbaru. */
export interface Transaction {
    id: string;
    asset: string;
    ticker: string;
    type: "buy" | "sell" | "transfer";
    amount: number;
    price: number;
    total: number;
    change: number;
    time: string;
}

// ─── Helper Generator ────────────────────────────────────────────────────────

/**
 * Menghasilkan data time-series dengan variasi realistis menggunakan
 * pergerakan acak terseeded (pseudo-random) yang deterministik.
 *
 * @param points     - Jumlah titik data
 * @param base       - Nilai awal
 * @param volatility - Maksimum perubahan per langkah
 * @param seed       - Nilai seed untuk konsistensi hasil
 */
function generateSeries(points: number, base: number, volatility: number, seed = 1): ChartPoint[] {
    const labels: Record<TimeRange, (i: number) => string> = {
        "1D": (i) => `${String(i).padStart(2, "0")}:00`,
        "7D": (i) => ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][i % 7],
        "1M": (i) => `${i + 1} Apr`,
        "3M": (i) => ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"][i % 6],
        "1Y": (i) => ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"][i % 12],
    };

    // Placeholder — dikembalikan per range saat dipanggil
    let val = base;
    let s = seed;
    const noise = () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return ((s >>> 0) / 0xffffffff) * 2 - 1;
    };

    return Array.from({ length: points }, (_, i) => {
        val = Math.max(base * 0.3, val + noise() * volatility);
        return {
            label: labels["1M"](i),
            value: Math.round(val),
            volume: Math.round(Math.abs(noise()) * base * 0.4),
            target: base,
        };
    });
}

/** Menghasilkan seri data untuk rentang waktu tertentu. */
export function getChartData(range: TimeRange): ChartPoint[] {
    const configs: Record<TimeRange, { points: number; base: number; vol: number; seed: number }> = {
        "1D": { points: 24, base: 43_500,  vol: 800,   seed: 11 },
        "7D": { points: 7,  base: 42_000,  vol: 2_000, seed: 22 },
        "1M": { points: 30, base: 40_000,  vol: 1_500, seed: 33 },
        "3M": { points: 12, base: 38_000,  vol: 3_000, seed: 44 },
        "1Y": { points: 12, base: 35_000,  vol: 5_000, seed: 55 },
    };

    const { points, base, vol, seed } = configs[range];
    let val = base;
    let s = seed;
    const noise = () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return ((s >>> 0) / 0xffffffff) * 2 - 1;
    };

    const labelFns: Record<TimeRange, (i: number) => string> = {
        "1D": (i) => `${String(i).padStart(2, "0")}:00`,
        "7D": (i) => ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][i],
        "1M": (i) => `${i + 1}`,
        "3M": (i) => ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"][i],
        "1Y": (i) => ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"][i],
    };

    return Array.from({ length: points }, (_, i) => {
        val = Math.max(base * 0.4, val + noise() * vol);
        return {
            label: labelFns[range](i),
            value: Math.round(val),
            volume: Math.round(Math.abs(noise()) * base * 0.5 + base * 0.1),
            target: base,
        };
    });
}

// ─── KPI Cards ───────────────────────────────────────────────────────────────

/** Kartu-kartu KPI yang ditampilkan di bagian atas dashboard. */
export const KPI_CARDS: KpiCard[] = [
    {
        id: "revenue",
        label: "Total Pendapatan",
        value: "Rp 4,82M",
        rawValue: 4_820_000_000,
        change: +12.4,
        subtitle: "vs bulan lalu",
        icon: "revenue",
        color: "sky",
        spark: [40, 55, 47, 62, 58, 71, 68, 75, 70, 82, 79, 91],
    },
    {
        id: "users",
        label: "Pengguna Aktif",
        value: "128,450",
        rawValue: 128_450,
        change: +8.7,
        subtitle: "MAU bulan ini",
        icon: "users",
        color: "emerald",
        spark: [80, 82, 85, 83, 88, 90, 87, 92, 94, 96, 98, 100],
    },
    {
        id: "transactions",
        label: "Total Transaksi",
        value: "94,218",
        rawValue: 94_218,
        change: +21.3,
        subtitle: "30 hari terakhir",
        icon: "transactions",
        color: "violet",
        spark: [50, 60, 55, 70, 65, 75, 80, 72, 85, 88, 91, 95],
    },
    {
        id: "profit",
        label: "Margin Keuntungan",
        value: "34.2%",
        rawValue: 34.2,
        change: -2.1,
        subtitle: "gross margin",
        icon: "profit",
        color: "amber",
        spark: [38, 37, 36, 38, 35, 34, 36, 35, 33, 34, 35, 34],
    },
];

// ─── Recent Transactions ─────────────────────────────────────────────────────

/** Data tabel transaksi terbaru. */
export const RECENT_TRANSACTIONS: Transaction[] = [
    { id: "TXN-001", asset: "Bitcoin",   ticker: "BTC", type: "buy",      amount: 0.52,  price: 43_250, total: 22_490, change: +3.2,  time: "2 menit lalu"   },
    { id: "TXN-002", asset: "Ethereum",  ticker: "ETH", type: "sell",     amount: 4.1,   price: 2_840,  total: 11_644, change: -1.8,  time: "15 menit lalu"  },
    { id: "TXN-003", asset: "Solana",    ticker: "SOL", type: "buy",      amount: 32,    price: 148,    total: 4_736,  change: +7.5,  time: "34 menit lalu"  },
    { id: "TXN-004", asset: "BNB",       ticker: "BNB", type: "transfer", amount: 10,    price: 612,    total: 6_120,  change: +0.4,  time: "1 jam lalu"     },
    { id: "TXN-005", asset: "Avalanche", ticker: "AVX", type: "sell",     amount: 75,    price: 38,     total: 2_850,  change: -4.2,  time: "2 jam lalu"     },
    { id: "TXN-006", asset: "Polygon",   ticker: "MAT", type: "buy",      amount: 1_200, price: 0.89,   total: 1_068,  change: +2.9,  time: "3 jam lalu"     },
    { id: "TXN-007", asset: "Chainlink", ticker: "LNK", type: "buy",      amount: 85,    price: 14.2,   total: 1_207,  change: +5.1,  time: "4 jam lalu"     },
];

// ─── Asset Allocation ────────────────────────────────────────────────────────

/** Data alokasi aset untuk donut chart. */
export const ASSET_ALLOCATION = [
    { name: "Bitcoin",  value: 42, color: "#f59e0b" },
    { name: "Ethereum", value: 28, color: "#6366f1" },
    { name: "Solana",   value: 15, color: "#10b981" },
    { name: "BNB",      value: 9,  color: "#f97316" },
    { name: "Lainnya",  value: 6,  color: "#94a3b8" },
];

/** Label untuk semua opsi filter waktu. */
export const TIME_RANGES: TimeRange[] = ["1D", "7D", "1M", "3M", "1Y"];

/**
 * @file Constants/news.ts
 *
 * All static data and configuration for the News feature.
 * Keeping this separate from UI components ensures a single
 * source of truth and makes it trivial to swap data sources.
 */

import type { NewsArticle } from "@/Types/types";

// ─── API Configuration ────────────────────────────────────────────────────────

/** Free-tier GNews token. Set VITE_GNEWS_TOKEN in your .env to override. */
export const GNEWS_TOKEN: string =
    import.meta.env.VITE_GNEWS_TOKEN ?? "a3fcb25cb5b5e258d98d09e4f8b47efc";

export const GNEWS_BASE_URL = "https://gnews.io/api/v4";

/** Number of articles per page request. */
export const ARTICLES_PER_PAGE = 9;

// ─── Category Definitions ────────────────────────────────────────────────────

export const NEWS_CATEGORIES = [
    "Semua",
    "Teknologi",
    "Ekonomi",
    "Pendidikan",
    "Politik",
    "Kesehatan",
    "Olahraga",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

/** Maps UI category labels to GNews topic/language params. */
export const CATEGORY_QUERY_MAP: Record<NewsCategory, string> = {
    Semua: "Indonesia",
    Teknologi: "Teknologi Indonesia",
    Ekonomi: "Ekonomi Indonesia",
    Pendidikan: "Pendidikan Indonesia",
    Politik: "Politik Indonesia",
    Kesehatan: "Kesehatan Indonesia",
    Olahraga: "Olahraga Indonesia",
};

// ─── Fallback Dummy Articles ──────────────────────────────────────────────────

const now = Date.now();

export const DUMMY_ARTICLES: NewsArticle[] = [
    {
        title: "Indonesia Perkuat Kerja Sama Digital ASEAN di Forum Teknologi 2025",
        description:
            "Delegasi Indonesia mempresentasikan roadmap transformasi digital nasional yang mencakup pengembangan infrastruktur, kecerdasan buatan, dan keamanan siber.",
        content:
            "Dalam forum teknologi ASEAN yang berlangsung di Jakarta, Indonesia membawa proposal ambisius untuk mempercepat adopsi teknologi di kawasan. Menteri Komunikasi menyampaikan bahwa peta jalan digital nasional akan menjadi referensi negara-negara berkembang.\n\nPerkembangan ini menjadi bagian dari upaya berkelanjutan untuk memperkuat posisi Indonesia di kancah regional maupun global. Para pemangku kepentingan dari berbagai sektor menyambut positif langkah ini sebagai tonggak penting dalam perjalanan pembangunan nasional.\n\nDengan fondasi kebijakan yang kuat dan dukungan dari berbagai pihak, diharapkan dampak positif dari inisiatif ini dapat dirasakan secara merata oleh seluruh lapisan masyarakat Indonesia.",
        url: "#",
        image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=500&fit=crop",
        publishedAt: new Date(now - 3_600_000).toISOString(),
        source: { name: "Kompas Tech", url: "#" },
    },
    {
        title: "Pertumbuhan Ekonomi Q1 2025 Capai 5,3 Persen, Melampaui Ekspektasi",
        description:
            "Badan Pusat Statistik mengumumkan pertumbuhan ekonomi Indonesia kuartal pertama 2025 sebesar 5,3 persen, didorong oleh konsumsi domestik dan ekspor non-migas.",
        content:
            "Angka pertumbuhan ini melebihi prediksi analis yang sebelumnya memperkirakan kisaran 5,0–5,1 persen. Sektor manufaktur dan perdagangan menjadi motor utama pertumbuhan di tengah ketidakpastian ekonomi global.\n\nGubernur Bank Indonesia menyampaikan bahwa posisi cadangan devisa yang kuat ini setara dengan pembiayaan 7,8 bulan impor. Hal ini mencerminkan fundamental ekonomi yang solid dan daya tahan yang baik terhadap guncangan global.",
        url: "#",
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop",
        publishedAt: new Date(now - 7_200_000).toISOString(),
        source: { name: "Bisnis Indonesia", url: "#" },
    },
    {
        title: "Program Beasiswa Nasional 2025 Dibuka, 50.000 Kursi Tersedia",
        description:
            "Kementerian Pendidikan membuka pendaftaran program beasiswa nasional dengan total 50 ribu kursi untuk jenjang D3, S1, hingga S3 dalam dan luar negeri.",
        content:
            "Program beasiswa ini mencakup berbagai skema mulai dari biaya pendidikan penuh, biaya hidup, hingga penempatan kerja pascastudi. Prioritas diberikan bagi daerah 3T (Terdepan, Terluar, Tertinggal).\n\nPendaftaran dibuka mulai 1 Mei 2025 dan ditutup pada 30 Juni 2025. Seleksi dilakukan secara online melalui portal beasiswa nasional.",
        url: "#",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=500&fit=crop",
        publishedAt: new Date(now - 10_800_000).toISOString(),
        source: { name: "Detik Edu", url: "#" },
    },
    {
        title: "Infrastruktur Tol Trans-Sumatera Tahap III Resmi Beroperasi",
        description:
            "Presiden meresmikan ruas tol Trans-Sumatera tahap ketiga sepanjang 247 kilometer, menghubungkan Padang dengan Pekanbaru.",
        content:
            "Dengan beroperasinya ruas tol baru ini, waktu tempuh Padang–Pekanbaru yang sebelumnya memakan 8 jam kini dapat diselesaikan dalam 3,5 jam. Proyek ini merupakan bagian dari program Nusantara Connectivity 2025.\n\nInvestasi total untuk segmen ini mencapai Rp 18,4 triliun, sebagian besar bersumber dari APBN dan kerja sama investasi swasta.",
        url: "#",
        image: "https://images.unsplash.com/photo-1545262484-a31a66c6e4d3?w=800&h=500&fit=crop",
        publishedAt: new Date(now - 14_400_000).toISOString(),
        source: { name: "CNN Indonesia", url: "#" },
    },
    {
        title: "Inovasi AI Lokal Mendapat Pengakuan Internasional di Geneva Tech Summit",
        description:
            "Startup teknologi Indonesia berhasil meraih penghargaan bergengsi di ajang Geneva Tech Summit atas inovasi kecerdasan buatan untuk deteksi penyakit tropis.",
        content:
            "Model AI yang dikembangkan tim peneliti dari Bandung ini mampu mendeteksi malaria, dengue, dan leptospirosis dari sampel darah dengan akurasi 97,4 persen. WHO menyatakan minat untuk mengadopsi teknologi ini di 45 negara berkembang.\n\nTim terdiri dari 12 peneliti muda yang rata-rata berusia di bawah 30 tahun. Mereka mengembangkan model ini selama 3 tahun dengan dukungan dana riset dari BRIN.",
        url: "#",
        image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=500&fit=crop",
        publishedAt: new Date(now - 18_000_000).toISOString(),
        source: { name: "Tech in Asia", url: "#" },
    },
    {
        title: "Cadangan Devisa Indonesia Tembus 150 Miliar Dolar AS",
        description:
            "Bank Indonesia melaporkan cadangan devisa nasional mencapai rekor tertinggi sepanjang sejarah, memberikan bantalan kuat terhadap volatilitas ekonomi global.",
        content:
            "Gubernur Bank Indonesia menyampaikan bahwa posisi cadangan devisa yang kuat ini setara dengan pembiayaan 7,8 bulan impor dan pembayaran utang luar negeri pemerintah.\n\nCapaian ini menjadi rekor tertinggi sepanjang sejarah Indonesia dan jauh melampaui standar kecukupan internasional yang ditetapkan IMF sebesar 3 bulan impor.",
        url: "#",
        image: "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&h=500&fit=crop",
        publishedAt: new Date(now - 21_600_000).toISOString(),
        source: { name: "Kontan", url: "#" },
    },
];

/** Dummy related articles used as fallback for the detail page sidebar. */
export const DUMMY_RELATED_ARTICLES: NewsArticle[] = [
    {
        title: "Transformasi Digital ASEAN: Peluang dan Tantangan bagi Indonesia",
        description: "Kawasan ASEAN terus bergerak menuju era digital dengan berbagai inisiatif regional.",
        content: "",
        url: "#",
        image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=400&fit=crop",
        publishedAt: new Date(now - 86_400_000).toISOString(),
        source: { name: "Tech in Asia", url: "#" },
    },
    {
        title: "Startup Unicorn Indonesia Capai Valuasi Rp 15 Triliun",
        description: "Ekosistem startup Indonesia terus bertumbuh dengan munculnya unicorn baru di sektor fintech.",
        content: "",
        url: "#",
        image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=400&fit=crop",
        publishedAt: new Date(now - 172_800_000).toISOString(),
        source: { name: "Bisnis Indonesia", url: "#" },
    },
    {
        title: "Infrastruktur 5G Nasional Diperluas ke 100 Kota",
        description: "Pemerintah mempercepat rollout jaringan 5G sebagai tulang punggung ekonomi digital.",
        content: "",
        url: "#",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
        publishedAt: new Date(now - 259_200_000).toISOString(),
        source: { name: "Kompas Tech", url: "#" },
    },
    {
        title: "Revolusi Industri 4.0: Manufaktur Indonesia Siap Bersaing Global",
        description: "Sektor manufaktur nasional mulai mengadopsi otomasi dan AI untuk meningkatkan produktivitas.",
        content: "",
        url: "#",
        image: "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=600&h=400&fit=crop",
        publishedAt: new Date(now - 345_600_000).toISOString(),
        source: { name: "CNN Indonesia", url: "#" },
    },
];

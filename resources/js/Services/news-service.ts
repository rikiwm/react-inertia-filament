/**
 * @file Services/newsService.ts
 *
 * Lapisan layanan untuk semua komunikasi API berita.
 *
 * Semua logika jaringan, penyimpanan sesi, dan strategi fallback berada
 * di sini. Komponen dan hook tidak pernah memanggil `fetch()` secara
 * langsung — mereka mendelegasikan ke service ini agar logika network
 * dapat diuji, ditukar, dan jauh dari masalah UI.
 */

import {
    ARTICLES_PER_PAGE,
    CATEGORY_QUERY_MAP,
    DUMMY_ARTICLES,
    DUMMY_RELATED_ARTICLES,
    GNEWS_BASE_URL,
    GNEWS_TOKEN,
} from "@/Constants/news";
import type { GNewsResponse, NewsArticle } from "@/Types/types";
import type { NewsCategory } from "@/Constants/news";

// ─── Pembantu Session Storage ──────────────────────────────────────────────────

/** Kunci yang digunakan untuk menyimpan artikel di sessionStorage. */
const DETAIL_STORAGE_KEY = "news_detail";

/**
 * Menyimpan data artikel ke sessionStorage agar bisa dibaca oleh halaman detail.
 *
 * Digunakan sebelum navigasi Inertia ke `/berita/detail`, karena Inertia
 * mereset state React saat berpindah halaman. sessionStorage memungkinkan
 * data bertahan selama satu sesi browser tanpa perlu memuatnya ulang dari API.
 *
 * @param article - Objek artikel yang ingin dipass ke halaman detail
 *
 * @example
 * saveArticleForDetail(article);
 * router.visit(route("news.detail"));
 */
export function saveArticleForDetail(article: NewsArticle): void {
    try {
        sessionStorage.setItem(DETAIL_STORAGE_KEY, JSON.stringify(article));
    } catch {
        // sessionStorage mungkin tidak tersedia di beberapa environment — abaikan error
    }
}

/**
 * Mengambil artikel yang sebelumnya disimpan dari sessionStorage.
 *
 * Dipanggil oleh halaman detail saat pertama kali di-mount untuk mendapatkan
 * data artikel tanpa perlu request API tambahan ke server. Mengembalikan `null`
 * jika tidak ada data tersimpan atau jika parsing JSON gagal.
 *
 * @returns Objek artikel yang tersimpan, atau `null` jika tidak ditemukan
 */
export function loadArticleFromStorage(): NewsArticle | null {
    try {
        const raw = sessionStorage.getItem(DETAIL_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as NewsArticle) : null;
    } catch {
        return null;
    }
}

// ─── Tipe Hasil Fetch ─────────────────────────────────────────────────────────

/** Struktur nilai yang dikembalikan oleh `fetchNewsArticles`. */
export interface FetchNewsResult {
    /** Daftar artikel hasil fetch atau fallback. */
    articles: NewsArticle[];
    /** Menunjukkan apakah ada lebih banyak halaman yang dapat dimuat. */
    hasMore: boolean;
    /** Menunjukkan apakah data bersumber dari dummy (fallback), bukan API. */
    usingFallback: boolean;
}

/**
 * Mengambil satu halaman artikel berita dari GNews API.
 *
 * Otomatis jatuh ke data dummy (`DUMMY_ARTICLES`) ketika:
 * - Request jaringan gagal (misal: kuota API habis, token tidak valid)
 * - API mengembalikan daftar kosong
 *
 * Mendukung pembatalan request via `AbortController` untuk menghindari
 * race condition saat pengguna mengetik cepat atau berganti kategori.
 *
 * @param category    - Filter kategori yang sedang aktif di UI
 * @param searchQuery - Kata kunci pencarian bebas (sudah di-debounce oleh pemanggil)
 * @param page        - Nomor halaman, dimulai dari 1
 * @param signal      - AbortSignal untuk pembatalan request yang sedang berjalan
 * @returns Objek berisi artikel, flag `hasMore`, dan flag `usingFallback`
 * @throws Error bernama "AbortError" jika request dibatalkan (harus di-re-throw oleh pemanggil)
 */
export async function fetchNewsArticles(
    category: NewsCategory,
    searchQuery: string,
    page: number,
    signal: AbortSignal,
): Promise<FetchNewsResult> {
    const query = searchQuery.trim() || CATEGORY_QUERY_MAP[category];

    const url = new URL(`${GNEWS_BASE_URL}/search`);
    url.searchParams.set("q", query);
    url.searchParams.set("lang", "id");
    url.searchParams.set("country", "id");
    url.searchParams.set("max", String(ARTICLES_PER_PAGE));
    url.searchParams.set("page", String(page));
    url.searchParams.set("token", GNEWS_TOKEN);

    try {
        const response = await fetch(url.toString(), { signal });

        if (!response.ok) {
            throw new Error(`GNews API merespons dengan status ${response.status}`);
        }

        const data = (await response.json()) as GNewsResponse;

        if (!data.articles || data.articles.length === 0) {
            throw new Error("GNews tidak mengembalikan artikel");
        }

        return {
            articles: data.articles,
            hasMore: data.articles.length === ARTICLES_PER_PAGE,
            usingFallback: false,
        };
    } catch (err) {
        // Re-throw pembatalan agar hook dapat menanganinya secara terpisah
        if ((err as Error).name === "AbortError") throw err;

        console.warn("[newsService] Jatuh ke data dummy:", (err as Error).message);

        // Filter dummy berdasarkan kata kunci pencarian jika ada
        const q = searchQuery.toLowerCase();
        const filtered = DUMMY_ARTICLES.filter(
            (a) =>
                !q ||
                a.title.toLowerCase().includes(q) ||
                a.description.toLowerCase().includes(q),
        );

        return { articles: filtered, hasMore: false, usingFallback: true };
    }
}

/**
 * Mengambil artikel-artikel terkait dari GNews berdasarkan nama sumber artikel saat ini.
 *
 * Mengambil 5 artikel dengan query nama sumber, lalu memfilter artikel
 * yang sedang dibaca agar tidak muncul di daftar rekomendasi.
 * Jatuh ke `DUMMY_RELATED_ARTICLES` jika terjadi error apapun.
 *
 * @param sourceName - Nama sumber artikel yang sedang dilihat (digunakan sebagai query)
 * @param excludeUrl - URL artikel saat ini yang harus dikecualikan dari hasil
 * @param signal     - AbortSignal untuk pembatalan request
 * @returns Array artikel terkait (maksimal 4), atau data dummy jika gagal
 * @throws Error bernama "AbortError" jika request dibatalkan
 */
export async function fetchRelatedArticles(
    sourceName: string,
    excludeUrl: string,
    signal: AbortSignal,
): Promise<NewsArticle[]> {
    const query = sourceName || "Indonesia";

    const url = new URL(`${GNEWS_BASE_URL}/search`);
    url.searchParams.set("q", query);
    url.searchParams.set("lang", "id");
    url.searchParams.set("max", "5");
    url.searchParams.set("token", GNEWS_TOKEN);

    try {
        const response = await fetch(url.toString(), { signal });

        if (!response.ok) throw new Error(`Status ${response.status}`);

        const data = (await response.json()) as GNewsResponse;

        if (!data.articles?.length) throw new Error("Tidak ada artikel terkait");

        return data.articles.filter((a) => a.url !== excludeUrl).slice(0, 4);
    } catch (err) {
        if ((err as Error).name === "AbortError") throw err;

        return DUMMY_RELATED_ARTICLES;
    }
}

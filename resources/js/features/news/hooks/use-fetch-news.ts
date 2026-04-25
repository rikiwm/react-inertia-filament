/**
 * @file Hooks/useFetchNews.ts
 *
 * Custom hook yang mengelola seluruh state dan side-effect untuk halaman daftar berita.
 *
 * Komponen halaman menjadi renderer tipis (thin renderer) — semua kebutuhan
 * pengambilan data, debounce pencarian, dan manajemen paginasi ada di sini
 * dan dapat diuji secara mandiri.
 */

import { NEWS_CATEGORIES } from "@/Constants/news";
import { fetchNewsArticles } from "@/Services/news-service";
import type { NewsArticle } from "@/Types/types";
import type { NewsCategory } from "@/Constants/news";
import { useCallback, useEffect, useRef, useState } from "react";

/** Nilai kembalian dari hook `useFetchNews`. */
export interface UseFetchNewsReturn {
    /** Daftar artikel yang saat ini ditampilkan. */
    articles: NewsArticle[];
    /** True selama request pertama (non-append) sedang berjalan. */
    loading: boolean;
    /** Pesan error jika fetch gagal dan fallback tidak tersedia. */
    error: string | null;
    /** True jika halaman berikutnya tersedia dan bisa dimuat. */
    hasMore: boolean;
    /** True jika data bersumber dari dummy, bukan dari API nyata. */
    usingFallback: boolean;
    /** Kategori yang sedang aktif dipilih user. */
    activeCategory: NewsCategory;
    /** Nilai mentah dari input pencarian (belum di-debounce). */
    searchQuery: string;
    /** Mengubah filter kategori aktif dan mereset halaman ke 1. */
    setActiveCategory: (category: NewsCategory) => void;
    /** Memperbarui nilai pencarian (debounce dilakukan secara internal). */
    setSearchQuery: (query: string) => void;
    /** Memuat halaman berikutnya dan menambahkannya ke daftar yang ada. */
    loadMore: () => void;
    /** Mencoba ulang fetch terakhir yang gagal. */
    retry: () => void;
}

/** Durasi debounce pencarian dalam milidetik. */
const DEBOUNCE_MS = 500;

/**
 * Mengelola pengambilan data, pencarian, dan paginasi artikel berita.
 *
 * Alur utama:
 * 1. Setiap perubahan `activeCategory` atau `searchQuery` (setelah debounce)
 *    akan mereset halaman ke 1 dan mengambil ulang data dari awal.
 * 2. `loadMore` menambah nomor halaman dan men-append artikel baru.
 * 3. Semua request unflight dibatalkan sebelum request baru dimulai
 *    menggunakan `AbortController` untuk menghindari race condition.
 *
 * @returns Objek state dan fungsi aksi siap pakai untuk komponen halaman
 *
 * @example
 * const { articles, loading, setSearchQuery } = useFetchNews();
 */
export function useFetchNews(): UseFetchNewsReturn {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [usingFallback, setUsingFallback] = useState(false);
    const [activeCategory, setActiveCategory] = useState<NewsCategory>(NEWS_CATEGORIES[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    /** Referensi AbortController untuk membatalkan request yang sedang berjalan. */
    const abortRef = useRef<AbortController | null>(null);

    // ── Debounce pencarian ──────────────────────────────────────────────────────

    /**
     * Menunda propagasi `searchQuery` ke `debouncedSearch` selama DEBOUNCE_MS.
     * Ini mencegah request API dikirim setiap keystroke.
     */
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ── Fungsi fetch inti ───────────────────────────────────────────────────────

    /**
     * Mengambil artikel dari service untuk halaman tertentu.
     *
     * @param pageNum - Nomor halaman yang akan difetch (mulai dari 1)
     * @param append  - Jika true, tambahkan ke artikel yang ada; jika false, ganti semua
     */
    const fetchPage = useCallback(
        async (pageNum: number, append: boolean) => {
            // Batalkan request sebelumnya sebelum memulai yang baru
            abortRef.current?.abort();
            abortRef.current = new AbortController();

            if (!append) setLoading(true);
            setError(null);

            try {
                const result = await fetchNewsArticles(
                    activeCategory,
                    debouncedSearch,
                    pageNum,
                    abortRef.current.signal,
                );

                setUsingFallback(result.usingFallback);
                setHasMore(result.hasMore);
                setArticles((prev) => (append ? [...prev, ...result.articles] : result.articles));
            } catch (err) {
                if ((err as Error).name === "AbortError") return; // request dibatalkan — normal
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        },
        [activeCategory, debouncedSearch],
    );

    // ── Reset dan fetch saat filter berubah ────────────────────────────────────

    /**
     * Setiap kali kategori atau kata pencarian berubah, reset ke halaman 1
     * dan ambil data dari awal (bukan append).
     */
    useEffect(() => {
        setPage(1);
        setArticles([]);
        fetchPage(1, false);
        // fetchPage sengaja tidak dimasukkan ke deps — stabil per perubahan kategori/pencarian
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCategory, debouncedSearch]);

    // ── Fungsi aksi yang diekspos ke komponen ──────────────────────────────────

    /**
     * Memuat halaman berikutnya dan menambahkan hasilnya ke daftar artikel saat ini.
     * Dipanggil saat user menekan tombol "Muat Lebih Banyak".
     */
    const loadMore = useCallback(() => {
        const next = page + 1;
        setPage(next);
        fetchPage(next, true);
    }, [page, fetchPage]);

    /**
     * Mencoba ulang fetch pada halaman yang sama. Berguna setelah error jaringan.
     */
    const retry = useCallback(() => {
        fetchPage(page, false);
    }, [page, fetchPage]);

    return {
        articles,
        loading,
        error,
        hasMore,
        usingFallback,
        activeCategory,
        searchQuery,
        setActiveCategory,
        setSearchQuery,
        loadMore,
        retry,
    };
}

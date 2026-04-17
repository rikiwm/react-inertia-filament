/**
 * @file Pages/NewsPage.tsx
 *
 * News list page — pure orchestration layer.
 *
 * All data-fetching state lives in `useFetchNews`.
 * All rendering delegates to isolated components in `Components/News/`.
 * This file should remain under ~120 lines.
 */

import FeaturedCard from "@/Components/News/FeaturedCard";
import NewsCard from "@/Components/News/NewsCard";
import SkeletonCard from "@/Components/News/SkeletonCard";
import { NEWS_CATEGORIES, type NewsCategory } from "@/Constants/news";
import { useFetchNews } from "@/Hooks/useFetchNews";
import { cn } from "@/Lib/Utils";
import FrontWrapper from "@/Wrappers/FrontWrapper";
import type { ReactNode } from "react";

// ─── Page Component ───────────────────────────────────────────────────────────

const NewsPage = () => {
    const {
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
    } = useFetchNews();

    const [featuredArticle, ...gridArticles] = articles;

    return (
        <div className="min-h-screen w-full pt-18 max-w-screen-3xl px-2 lg:px-4 mx-auto">
            {/* ── Hero Banner ── */}
            <div
                className={cn(
                    "relative w-full px-6 lg:px-12 rounded-3xl",
                    "border border-teal-200 dark:border-teal-800",
                    "bg-gradient-to-t from-teal-50 via-teal-50 to-teal-50/50",
                    "dark:bg-gradient-to-t dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900",
                    "overflow-hidden",
                )}
            >
                <div className="relative max-w-7xl mx-auto text-center py-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-sm border border-black/10 dark:border-white/20 text-neutral-700 dark:text-neutral-300 text-sm font-medium mb-6">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Berita Terbaru &amp; Terpercaya
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-extrabold text-neutral-900 dark:text-white mb-4 leading-tight">
                        Portal{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-500">
                            Berita
                        </span>
                    </h1>
                    <p className="text-neutral-600 dark:text-sky-200 text-lg max-w-2xl mx-auto mb-10">
                        Temukan berita teknologi, ekonomi, pendidikan, dan berbagai topik terkini yang terpercaya.
                    </p>

                    {/* Search */}
                    <div className="relative max-w-xl mx-auto">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-neutral-400 dark:text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            id="news-search-input"
                            type="text"
                            placeholder="Cari berita..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "w-full pl-12 pr-4 py-3 rounded-2xl",
                                "bg-white dark:bg-white/10 backdrop-blur-sm",
                                "border border-neutral-200 dark:border-white/20 focus:border-sky-400",
                                "text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-sky-300",
                                "outline-none focus:ring-2 focus:ring-sky-500/40",
                                "transition-all duration-300 text-base shadow-sm",
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* ── Category chips (sticky) ── */}
            <div className="sticky top-18 rounded-full z-40 bg-transparent dark:bg-neutral-950/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 lg:px-0 py-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {NEWS_CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                id={`news-category-${cat.toLowerCase()}`}
                                onClick={() => setActiveCategory(cat as NewsCategory)}
                                className={cn(
                                    "flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                    activeCategory === cat
                                        ? "bg-teal-600 text-white shadow-xs shadow-sky-200 dark:shadow-sky-900"
                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-sky-50 dark:hover:bg-neutral-700 hover:text-sky-600 dark:hover:text-sky-400",
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="max-w-7xl mx-auto px-6 lg:px-0 py-12">
                {/* Fallback notice */}
                {usingFallback && !loading && (
                    <div className="mb-8 flex items-start gap-3 p-4 rounded-xl bg-sky-50 dark:bg-zinc-900/20 border border-sky-200 dark:border-teal-800">
                        <svg className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-teal-700 dark:text-teal-300 text-sm font-semibold">Menampilkan Data Demo</p>
                            <p className="text-teal-600 dark:text-teal-400 text-xs mt-0.5">
                                Koneksi ke API berita tidak tersedia. Set <code className="font-mono">VITE_GNEWS_TOKEN</code> di <code className="font-mono">.env</code> untuk berita nyata.
                            </p>
                        </div>
                    </div>
                )}

                {/* Error state */}
                {error && !usingFallback && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-neutral-700 dark:text-neutral-300 font-semibold text-lg mb-2">Gagal memuat berita</p>
                        <p className="text-neutral-500 text-sm mb-6">{error}</p>
                        <button onClick={retry} className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium transition-colors">
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Skeletons */}
                {loading && (
                    <>
                        <div className="mb-10 h-[480px] rounded-3xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    </>
                )}

                {/* Articles */}
                {!loading && articles.length > 0 && (
                    <>
                        {featuredArticle && (
                            <div className="mb-10">
                                <FeaturedCard article={featuredArticle} />
                            </div>
                        )}

                        {gridArticles.length > 0 && (
                            <>
                                <div className="flex items-center gap-4 mb-6">
                                    <h2 className="text-neutral-900 dark:text-neutral-100 font-bold text-xl">Berita Lainnya</h2>
                                    <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
                                    <span className="text-neutral-500 text-sm">{gridArticles.length} artikel</span>
                                </div>
                                <div id="news-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {gridArticles.map((article, i) => (
                                        <NewsCard key={article.url} article={article} index={i} />
                                    ))}
                                </div>
                            </>
                        )}

                        {hasMore && !usingFallback && (
                            <div className="flex justify-center mt-12">
                                <button
                                    id="news-load-more"
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="group flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-lg shadow-sky-200 dark:shadow-sky-900/40 transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Muat Lebih Banyak
                                    <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Empty state */}
                {!loading && articles.length === 0 && !error && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-neutral-700 dark:text-neutral-300 font-semibold text-lg mb-2">Tidak ada berita ditemukan</p>
                        <p className="text-neutral-500 text-sm">Coba kata kunci atau kategori yang berbeda.</p>
                    </div>
                )}
            </div>

            {/* ── Footer strip ── */}
            <div className="border-t border-neutral-200 dark:border-neutral-800 py-8 mt-4">
                <div className="max-w-7xl mx-auto px-6 lg:px-0 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-neutral-500">
                    <span>
                        Data bersumber dari{" "}
                        <a href="https://gnews.io" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">
                            GNews API
                        </a>
                    </span>
                    <span>Diperbarui secara otomatis</span>
                </div>
            </div>
        </div>
    );
};

NewsPage.layout = (page: ReactNode) => <FrontWrapper title="Berita">{page}</FrontWrapper>;

export default NewsPage;

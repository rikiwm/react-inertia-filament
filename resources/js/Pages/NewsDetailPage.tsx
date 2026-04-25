/**
 * @file Pages/NewsDetailPage.tsx
 *
 * Article detail page — pure orchestration layer.
 *
 * - Article data is read from sessionStorage (set by newsService.saveArticleForDetail).
 * - Related articles are fetched via newsService.fetchRelatedArticles.
 * - UI delegates to isolated, memoized components.
 * - No circular imports — service layer owns storage helpers.
 * - Target: ~130 lines.
 */

import ReadingProgress from "@/features/news/components/reading-progress";
import RelatedCard from "@/features/news/components/related-card";
import ShareBar from "@/features/news/components/share-bar";
import { formatDate, estimateReadingTime, parseArticleContent } from "@/features/news/components/helpers";
import { fetchRelatedArticles, loadArticleFromStorage } from "@/Services/news-service";
import { useReadingProgress } from "@/features/news/hooks/use-reading-progress";
import type { NewsArticle } from "@/Types/types";
import { cn } from "@/Lib/utils";
import FrontWrapper from "@/Wrappers/front-wrapper";
import { router } from "@inertiajs/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { route } from "ziggy-js";

// ─── Page Component ───────────────────────────────────────────────────────────

const NewsDetailPage = () => {
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [related, setRelated] = useState<NewsArticle[]>([]);
    const [loadingRelated, setLoadingRelated] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const progress = useReadingProgress();
    const abortRef = useRef<AbortController | null>(null);

    // Load article from sessionStorage on mount
    useEffect(() => {
        const stored = loadArticleFromStorage();
        if (stored) {
            setArticle(stored);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            setNotFound(true);
        }
    }, []);

    // Fetch related articles whenever the main article is set
    useEffect(() => {
        if (!article) return;

        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setLoadingRelated(true);

        fetchRelatedArticles(article.source.name, article.url, abortRef.current.signal)
            .then(setRelated)
            .catch(() => {/* fallback already handled inside service */ })
            .finally(() => setLoadingRelated(false));

        return () => abortRef.current?.abort();
    }, [article]);

    const goBack = () => router.visit(route("news"));

    // ── Not found ──
    if (notFound) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Artikel Tidak Ditemukan</p>
                <p className="text-neutral-500 mb-8 max-w-sm">Artikel tidak tersedia atau tautan sudah kadaluarsa.</p>
                <button id="back-to-news" onClick={goBack} className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors">
                    ← Kembali ke Berita
                </button>
            </div>
        );
    }

    // ── Loading ──
    if (!article) {
        return (
            <div className="min-h-screen pt-40 pb-20 max-w-4xl mx-auto px-6 animate-pulse">
                <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full mb-8" />
                <div className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded-2xl mb-3" />
                <div className="h-12 w-4/5 bg-neutral-200 dark:bg-neutral-800 rounded-2xl mb-8" />
                <div className="h-[480px] bg-neutral-200 dark:bg-neutral-800 rounded-3xl mb-10" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-3" />
                ))}
            </div>
        );
    }

    const paragraphs = parseArticleContent(article.content || article.description || "");
    const readMinutes = estimateReadingTime(`${article.content ?? ""} ${article.description ?? ""}`);

    return (
        <>
            <ReadingProgress progress={progress} />

            <div className="min-h-screen w-full">
                {/* Hero image */}
                <div className="relative w-full h-[55vh] min-h-[480px] overflow-hidden">
                    <img
                        src={article.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1400&h=700&fit=crop"}
                        alt={article.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1400&h=700&fit=crop"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                    <div className="absolute top-6 left-6 pt-16">
                        <button id="detail-back-btn" onClick={goBack} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium border border-white/30 transition-all">
                            ← Kembali
                        </button>
                    </div>
                    <div className="absolute bottom-6 inset-x-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-600/90 text-white backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                            {article.source.name}
                        </span>
                    </div>
                </div>

                {/* Layout */}
                <div className="max-w-7xl mx-auto px-6 lg:px-0 py-10">
                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* Article */}
                        <article className="flex-1 min-w-0">
                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-neutral-500">
                                <span>{formatDate(article.publishedAt)}</span>
                                <span className="text-neutral-300 dark:text-neutral-600">•</span>
                                <span>{readMinutes} menit baca</span>
                                <span className="text-neutral-300 dark:text-neutral-600">•</span>
                                <a href={article.source.url !== "#" ? article.source.url : undefined} target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                                    {article.source.name}
                                </a>
                            </div>

                            {/* Title */}
                            <h1 className="text-neutral-900 dark:text-neutral-50 text-3xl lg:text-5xl font-bold leading-tight mb-6">
                                {article.title}
                            </h1>

                            {/* Share + source link */}
                            <div className="flex items-center justify-between flex-wrap gap-4 mb-8 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                <ShareBar article={article} />
                                {article.url !== "#" && (
                                    <a href={article.url} target="_blank" rel="noopener noreferrer" id="read-original" className="flex items-center gap-1.5 text-sm text-teal-600 dark:text-teal-400 hover:underline font-medium">
                                        Baca di sumber asli
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </a>
                                )}
                            </div>

                            {/* Lead */}
                            <p className="text-neutral-700 dark:text-neutral-300 text-xl leading-relaxed font-medium mb-8 pl-5 border-l-4 border-teal-500 italic">
                                {article.description}
                            </p>

                            {/* Decorative divider */}
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                                <div className="flex gap-1">{[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-teal-400 dark:bg-teal-600" />)}</div>
                                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                            </div>

                            {/* Body */}
                            <div id="article-body">
                                {paragraphs.length > 0 ? (
                                    paragraphs.map((para, i) => (
                                        <p key={i} className="mb-5 text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg">{para}</p>
                                    ))
                                ) : (
                                    <>
                                        <p className="mb-5 text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg">{article.description}</p>
                                        <p className="mb-5 text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg">Perkembangan ini menjadi bagian dari upaya berkelanjutan untuk memperkuat posisi Indonesia di kancah regional maupun global. Para pemangku kepentingan dari berbagai sektor menyambut positif langkah ini sebagai tonggak penting dalam perjalanan pembangunan nasional.</p>
                                        <p className="mb-5 text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg">Dengan fondasi kebijakan yang kuat dan dukungan dari berbagai pihak, diharapkan dampak positif dari inisiatif ini dapat dirasakan secara merata oleh seluruh lapisan masyarakat Indonesia dalam waktu dekat.</p>
                                    </>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                                {["Indonesia", "Berita Terkini", article.source.name].map((tag) => (
                                    <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800">
                                        #{tag.replace(/\s+/g, "")}
                                    </span>
                                ))}
                            </div>

                            {/* Attribution */}
                            <div className="mt-8 p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{article.source.name}</p>
                                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">
                                        Artikel ini bersumber dari {article.source.name}.{" "}
                                        {article.url !== "#" && (
                                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">
                                                Kunjungi sumber asli →
                                            </a>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </article>

                        {/* Sidebar */}
                        <aside className="w-full lg:w-96 flex-shrink-0">
                            <div className="sticky top-28 space-y-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-5">
                                        <h2 className="text-neutral-900 dark:text-neutral-100 font-bold text-lg">Berita Terkait</h2>
                                        <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
                                    </div>
                                    <div className="space-y-3">
                                        {loadingRelated
                                            ? Array.from({ length: 4 }).map((_, i) => (
                                                <div key={i} className="flex gap-4 p-3 rounded-2xl animate-pulse bg-neutral-100 dark:bg-neutral-800">
                                                    <div className="w-24 h-20 rounded-xl bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" />
                                                    <div className="flex-1 space-y-2 py-1">
                                                        <div className="h-2 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                                        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                                        <div className="h-3 w-4/5 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                                    </div>
                                                </div>
                                            ))
                                            : related.map((rel, i) => (
                                                <RelatedCard key={rel.url} article={rel} index={i} />
                                            ))}
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className={cn("p-6 rounded-3xl", "bg-gradient-to-br from-teal-600 to-teal-600", "text-white")}>
                                    <h3 className="font-bold text-lg mb-2">Jelajahi Lebih Banyak</h3>
                                    <p className="text-teal-100 text-sm mb-4">Temukan berita terkini lainnya di portal berita kami.</p>
                                    <button id="sidebar-back-news" onClick={goBack} className="w-full py-2.5 rounded-xl bg-white text-teal-700 font-semibold text-sm hover:bg-teal-50 transition-colors">
                                        ← Semua Berita
                                    </button>
                                </div>
                            </div>
                        </aside>

                    </div>
                </div>
            </div>
        </>
    );
};

NewsDetailPage.layout = (page: ReactNode) => <FrontWrapper title="Detail Berita">{page}</FrontWrapper>;

export default NewsDetailPage;

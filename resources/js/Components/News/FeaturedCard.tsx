/**
 * @file Components/News/FeaturedCard.tsx
 *
 * The large hero-style card shown as the first (featured) article
 * on the news list page.
 *
 * Wrapped in `React.memo` — only re-renders when the article object changes,
 * preventing unnecessary re-renders during category/search state updates.
 */

import { cn } from "@/Lib/Utils";
import { saveArticleForDetail } from "@/Services/newsService";
import type { NewsArticle } from "@/Types/Types";
import { router } from "@inertiajs/react";
import { memo, useCallback } from "react";
import { route } from "ziggy-js";
import { timeAgo } from "./helpers";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop";

interface FeaturedCardProps {
    article: NewsArticle;
}

const FeaturedCard = memo(function FeaturedCard({ article }: FeaturedCardProps) {
    const handleClick = useCallback(() => {
        saveArticleForDetail(article);
        router.visit(route("news.detail"));
    }, [article]);

    const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
    }, []);

    return (
        <button
            onClick={handleClick}
            id="news-featured-card"
            className={cn(
                "group relative rounded-3xl overflow-hidden block w-full text-left cursor-pointer",
                "border border-neutral-200 dark:border-neutral-800",
                "shadow-lg hover:shadow-2xl",
                "transition-all duration-500",
                "h-[480px] lg:h-[540px]",
            )}
        >
            <img
                src={article.image || FALLBACK_IMAGE}
                alt={article.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={handleImageError}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* BERITA UTAMA badge */}
            <div className="absolute top-5 left-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-600/90 text-white backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
                    BERITA UTAMA
                </span>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-teal-400 text-xs font-semibold uppercase tracking-wider">
                        {article.source.name}
                    </span>
                    <span className="text-neutral-500 text-xs">•</span>
                    <span className="text-neutral-400 text-xs">{timeAgo(article.publishedAt)}</span>
                </div>
                <h2 className="text-white text-2xl lg:text-3xl font-bold leading-tight mb-3 group-hover:text-teal-300 transition-colors duration-300">
                    {article.title}
                </h2>
                <p className="text-neutral-300 text-sm lg:text-base line-clamp-2">
                    {article.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-teal-400 text-sm font-medium group-hover:gap-3 transition-all duration-300">
                    Baca Selengkapnya
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </div>
        </button>
    );
});

export default FeaturedCard;

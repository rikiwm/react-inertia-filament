/**
 * @file Components/News/NewsCard.tsx
 *
 * Card component for a single article in the grid layout.
 * Memoized to avoid re-rendering unchanged cards when the list updates.
 */

import { cn } from "@/Lib/utils";
import { saveArticleForDetail } from "@/Services/news-service";
import type { NewsArticle } from "@/Types/types";
import { router } from "@inertiajs/react";
import { memo, useCallback } from "react";
import { route } from "ziggy-js";
import { timeAgo, truncate } from "./helpers";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=500&fit=crop";

interface NewsCardProps {
    article: NewsArticle;
    /** Zero-based index within the grid — used for `id` attribute. */
    index: number;
}

const NewsCard = memo(function NewsCard({ article, index }: NewsCardProps) {
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
            id={`news-card-${index}`}
            className={cn(
                "group rounded-2xl overflow-hidden w-full text-left cursor-pointer",
                "bg-white dark:bg-neutral-900",
                "border border-neutral-100 dark:border-neutral-800",
                "hover:border-teal-300 dark:hover:border-teal-700",
                "shadow-sm hover:shadow-xl",
                "transition-all duration-300",
                "hover:-translate-y-1",
            )}
        >
            {/* Thumbnail */}
            <div className="relative h-52 overflow-hidden">
                <img
                    src={article.image || FALLBACK_IMAGE}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Body */}
            <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-teal-600 dark:text-teal-400 text-xs font-semibold uppercase tracking-wider">
                        {article.source.name}
                    </span>
                    <span className="text-neutral-400 text-xs">{timeAgo(article.publishedAt)}</span>
                </div>
                <h3 className="text-neutral-900 dark:text-neutral-100 font-bold text-base leading-snug mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300 line-clamp-2">
                    {article.title}
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed line-clamp-3">
                    {truncate(article.description, 130)}
                </p>
            </div>

            {/* Footer CTA */}
            <div className="px-5 pb-4 flex items-center gap-1 text-teal-600 dark:text-teal-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Baca Artikel
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </div>
        </button>
    );
});

export default NewsCard;

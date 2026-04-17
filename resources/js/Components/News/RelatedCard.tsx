/**
 * @file Components/News/RelatedCard.tsx
 *
 * Compact horizontal card shown in the detail page sidebar.
 * Memoized so the list doesn't re-render while the article body is scrolling.
 */

import { cn } from "@/Lib/Utils";
import { saveArticleForDetail } from "@/Services/newsService";
import type { NewsArticle } from "@/Types/Types";
import { router } from "@inertiajs/react";
import { memo, useCallback } from "react";
import { route } from "ziggy-js";
import { timeAgo } from "./helpers";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=200&fit=crop";

interface RelatedCardProps {
    article: NewsArticle;
    index: number;
}

const RelatedCard = memo(function RelatedCard({ article, index }: RelatedCardProps) {
    const handleClick = useCallback(() => {
        saveArticleForDetail(article);
        router.visit(route("news.detail"));
    }, [article]);

    const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
    }, []);

    return (
        <button
            id={`related-card-${index}`}
            onClick={handleClick}
            className={cn(
                "group w-full text-left flex gap-4",
                "p-3 rounded-2xl",
                "bg-white dark:bg-neutral-900",
                "border border-neutral-100 dark:border-neutral-800",
                "hover:border-teal-300 dark:hover:border-teal-700",
                "shadow-sm hover:shadow-lg",
                "transition-all duration-300",
            )}
        >
            <div className="flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden">
                <img
                    src={article.image || FALLBACK_IMAGE}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={handleImageError}
                />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-teal-600 dark:text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    {article.source.name}
                </p>
                <h4 className="text-neutral-900 dark:text-neutral-100 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {article.title}
                </h4>
                <p className="text-neutral-400 text-xs mt-1">{timeAgo(article.publishedAt)}</p>
            </div>
        </button>
    );
});

export default RelatedCard;

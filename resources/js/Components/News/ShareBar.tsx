/**
 * @file Components/News/ShareBar.tsx
 *
 * Social sharing buttons for a news article.
 * Builds share URLs client-side and exposes WhatsApp, X/Twitter, and copy-link actions.
 */

import { cn } from "@/Lib/Utils";
import type { NewsArticle } from "@/Types/Types";
import { memo, useCallback, useState } from "react";

interface ShareBarProps {
    article: NewsArticle;
}

const ShareBar = memo(function ShareBar({ article }: ShareBarProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard API unavailable — fail silently
        }
    }, [shareUrl]);

    const handleWhatsApp = useCallback(() => {
        window.open(
            `https://wa.me/?text=${encodeURIComponent(`${article.title} ${shareUrl}`)}`,
            "_blank",
            "noopener,noreferrer",
        );
    }, [article.title, shareUrl]);

    const handleTwitter = useCallback(() => {
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`,
            "_blank",
            "noopener,noreferrer",
        );
    }, [article.title, shareUrl]);

    return (
        <div className="flex items-center gap-2">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Bagikan:</span>

            {/* WhatsApp */}
            <button
                id="share-whatsapp"
                onClick={handleWhatsApp}
                title="Bagikan ke WhatsApp"
                className="p-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </button>

            {/* X / Twitter */}
            <button
                id="share-twitter"
                onClick={handleTwitter}
                title="Bagikan ke X / Twitter"
                className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            </button>

            {/* Copy link */}
            <button
                id="share-copy"
                onClick={handleCopy}
                title={copied ? "Tautan disalin!" : "Salin tautan"}
                className={cn(
                    "p-2 rounded-xl transition-colors",
                    copied
                        ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                        : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700",
                )}
            >
                {copied ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                )}
            </button>
        </div>
    );
});

export default ShareBar;

/**
 * @file Components/News/SkeletonCard.tsx
 *
 * Loading placeholder for a NewsCard. Uses CSS animation only —
 * no JS timers, no runtime overhead.
 */

import { cn } from "@/Lib/Utils";
import { memo } from "react";

const SkeletonCard = memo(function SkeletonCard() {
    return (
        <div
            className={cn(
                "rounded-2xl overflow-hidden animate-pulse",
                "bg-white dark:bg-neutral-900",
                "border border-neutral-100 dark:border-neutral-800",
            )}
        >
            <div className="h-52 bg-neutral-200 dark:bg-neutral-800" />
            <div className="p-5 space-y-3">
                <div className="h-3 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                <div className="h-5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                <div className="h-5 w-4/5 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-700 rounded-full" />
                <div className="h-3 w-3/4 bg-neutral-100 dark:bg-neutral-700 rounded-full" />
            </div>
        </div>
    );
});

export default SkeletonCard;

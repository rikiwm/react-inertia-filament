/**
 * @file Components/News/ReadingProgress.tsx
 *
 * A thin progress bar fixed at the very top of the viewport that reflects
 * the `useReadingProgress` percentage. Pure presenter — receives the value
 * as a prop so it can be rendered without owning scroll state.
 */

import { memo } from "react";

interface ReadingProgressProps {
    /** 0 – 100 */
    progress: number;
}

const ReadingProgress = memo(function ReadingProgress({ progress }: ReadingProgressProps) {
    return (
        <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent" aria-hidden="true">
            <div
                className="h-full bg-gradient-to-r from-teal-500 to-teal-500 transition-all duration-75"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
});

export default ReadingProgress;

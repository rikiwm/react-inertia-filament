/**
 * @file features/dashboard/components/section-heading.tsx
 *
 * Section heading component for dashboard panels.
 * Extracted from DashboardPage.tsx.
 */

import type { ReactNode } from "react";

interface SectionHeadingProps {
    children: ReactNode;
    sub?: string;
}

export const SectionHeading = ({ children, sub }: SectionHeadingProps) => (
    <div className="mb-5">
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {children}
        </h2>
        {sub && <p className="text-xs text-neutral-500 mt-0.5">{sub}</p>}
    </div>
);

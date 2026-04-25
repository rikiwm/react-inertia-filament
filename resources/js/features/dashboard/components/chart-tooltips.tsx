/**
 * @file features/dashboard/components/chart-tooltips.tsx
 *
 * Tooltip components for Recharts charts used in the Dashboard.
 * Extracted from DashboardPage.tsx.
 */

import { fmtUSD, fmtCompact, fmtRupiahFull } from "@/Lib/formatters";

// ─── Area Chart Tooltip ──────────────────────────────────────────────────────

export const AreaTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl px-4 py-3 text-sm">
            <p className="text-neutral-400 text-xs mb-1">{label}</p>
            <p className="font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {fmtUSD(payload[0].value)}
            </p>
            {payload[1] && (
                <p className="text-neutral-500 text-xs mt-0.5">
                    Volume: {fmtCompact(payload[1].value)}
                </p>
            )}
        </div>
    );
};

// ─── Donut Chart Tooltip ─────────────────────────────────────────────────────

export const DonutTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-teal-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl px-4 py-3 text-sm">
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                {payload[0].name}
            </p>
            <p className="text-neutral-500 mt-0.5">
                {typeof payload[0].value === "number"
                    ? payload[0].value.toFixed(2)
                    : payload[0].value}
                %
            </p>
            {payload[0].payload?.rupiah !== undefined && (
                <p className="text-xs text-neutral-400 mt-0.5">
                    {fmtRupiahFull(payload[0].payload.rupiah)}
                </p>
            )}
        </div>
    );
};

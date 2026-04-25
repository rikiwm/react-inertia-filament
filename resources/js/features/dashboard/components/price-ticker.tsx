/**
 * @file features/dashboard/components/price-ticker.tsx
 *
 * Baris ticker pendapatan SKPD yang bergerak horizontal (marquee).
 * Extracted from DashboardPage.tsx.
 */

import { memo, useMemo } from "react";
import { cn } from "@/Lib/utils";
import { fmtRupiah } from "@/Lib/formatters";
import type { PendapatanSkpdNormalized } from "@/Types/pendapatan-skpd";

/**
 * Baris ticker pendapatan SKPD yang bergerak horizontal (marquee).
 * Menampilkan label SKPD, persentase realisasi, dan sisa anggaran.
 */
export const PriceTicker = memo(function PriceTicker({
    data,
}: {
    data: PendapatanSkpdNormalized[] | null;
}) {
    if (!data || data.length === 0) {
        return (
            <div className="overflow-hidden w-full border-b border-teal-300 dark:border-teal-800 bg-transparent dark:bg-neutral-950">
                <div className="flex whitespace-nowrap py-2 px-6">
                    <span className="text-xs text-neutral-400 animate-pulse">
                        Memuat data pendapatan SKPD...
                    </span>
                </div>
            </div>
        );
    }

    const items = useMemo(() => [...data, ...data], [data]); // duplikasi untuk efek loop seamless

    return (
        <div className="overflow-hidden w-full border-b border-teal-300 dark:border-teal-800 bg-transparent dark:bg-neutral-950">
            <div className="flex animate-[marquee_60s_linear_infinite] whitespace-nowrap py-2 gpu-accelerated">
                {items.map((t, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center gap-2 px-6 text-xs border-r border-neutral-100 dark:border-neutral-800"
                    >
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                            {t.label}
                        </span>
                        <span className="font-mono text-neutral-900 dark:text-neutral-100">
                            {t.persen.toFixed(1)}%
                        </span>
                        <span className={cn("font-medium text-emerald-600 dark:text-emerald-400")}>
                            {t.persen >= 100 ? "Tercapai" : "Sisa : " + fmtRupiah(t.sisa)}
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
});

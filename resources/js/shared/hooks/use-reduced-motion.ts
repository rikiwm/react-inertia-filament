/**
 * @file Hooks/use-reduced-motion.ts
 *
 * Hook untuk mendeteksi preferensi reduced motion pengguna.
 * Extracted from DashboardPage.tsx.
 */

import { useEffect, useState } from "react";

/**
 * Detects if the user prefers reduced motion (low-spec device or OS accessibility setting).
 * Returns true when animations should be minimized.
 */
export function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    });

    useEffect(() => {
        const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
        if (!mq) return;
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    return reduced;
}

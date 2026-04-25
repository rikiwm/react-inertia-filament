/**
 * @file Hooks/index.ts
 *
 * @deprecated Import hooks directly from their feature module instead:
 *   - Dashboard:          @/features/dashboard/hooks
 *   - PBJ:               @/features/pbj/hooks
 *   - Belanja Daerah:    @/features/belanja-daerah/hooks
 *   - Pendapatan Daerah: @/features/pendapatan-daerah/hooks
 *   - News:              @/features/news/hooks
 *   - PK Wako:           @/features/pk-wako/hooks
 *   - Progul:            @/features/progul/hooks
 *   - Global:            @/shared/hooks
 *
 * Kept temporarily for backward compatibility.
 */

// ── Global hooks ──────────────────────────────────────────────────────────────
export { useReducedMotion } from "@/shared/hooks/use-reduced-motion";
export { default as useTheme } from "@/shared/hooks/use-theme";

// ── Dashboard hooks ───────────────────────────────────────────────────────────
export { useApbdData } from "@/features/dashboard/hooks/use-apbd-data";
export { useOpdDetail } from "@/features/dashboard/hooks/use-opd-detail";

// ── PBJ hooks ─────────────────────────────────────────────────────────────────
export { usePbjData } from "@/features/pbj/hooks/use-pbj-data";
export { usePbjDetail } from "@/features/pbj/hooks/use-pbj-detail";
export { useOpdPbj } from "@/features/pbj/hooks/use-opd-pbj";

// ── Belanja Daerah hooks ──────────────────────────────────────────────────────
export { useBelanjaDaerahData } from "@/features/belanja-daerah/hooks/use-belanja-daerah-data";

// ── Pendapatan Daerah hooks ───────────────────────────────────────────────────
export { usePendapatanDaerahData } from "@/features/pendapatan-daerah/hooks/use-pendapatan-daerah-data";
export { usePendapatanSkpd } from "@/features/pendapatan-daerah/hooks/use-pendapatan-skpd";
export { usePendapatanSkpdDetail } from "@/features/pendapatan-daerah/hooks/use-pendapatan-skpd-detail";

// ── News hooks ────────────────────────────────────────────────────────────────
export { useFetchNews } from "@/features/news/hooks/use-fetch-news";
export { useReadingProgress } from "@/features/news/hooks/use-reading-progress";

// ── PK Wako hooks ─────────────────────────────────────────────────────────────
export { usePkWako } from "@/features/pk-wako/hooks/use-pk-wako";

// ── Progul hooks ──────────────────────────────────────────────────────────────
export { useProgulData } from "@/features/progul/hooks/use-progul-data";
export { useRealisasiProgram } from "@/features/progul/hooks/use-realisasi-program";

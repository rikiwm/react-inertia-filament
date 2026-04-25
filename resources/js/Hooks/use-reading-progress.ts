/**
 * @file Hooks/useReadingProgress.ts
 *
 * Hook yang melacak kemajuan membaca pengguna sebagai persentase (0–100)
 * berdasarkan seberapa jauh mereka menggulir halaman ke bawah.
 */

import { useCallback, useEffect, useState } from "react";

/**
 * Menghitung persentase kemajuan membaca berdasarkan posisi scroll halaman.
 *
 * Memasang event listener `scroll` yang pasif (non-blocking) pada `window`
 * untuk performa maksimal. Listener dibersihkan saat komponen di-unmount
 * untuk mencegah memory leak.
 *
 * Logika perhitungan:
 * - `scrollHeight - clientHeight` = total jarak yang bisa digulir
 * - `scrollTop / total * 100` = persentase kemajuan
 * - Nilai diklem (clamped) antara 0 dan 100
 *
 * @returns Nilai numerik kemajuan baca antara 0 (atas) dan 100 (bawah halaman)
 *
 * @example
 * const progress = useReadingProgress();
 * // Gunakan sebagai lebar progress bar:
 * <div style={{ width: `${progress}%` }} />
 */
export function useReadingProgress(): number {
    const [progress, setProgress] = useState(0);

    /**
     * Menghitung dan memperbarui nilai progress saat scroll terjadi.
     * Dibungkus dalam `useCallback` agar referensinya stabil dan tidak
     * menyebabkan addEventListener/removeEventListener dipanggil berulang.
     */
    const handleScroll = useCallback(() => {
        const el = document.documentElement;
        const total = el.scrollHeight - el.clientHeight;

        setProgress(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0);
    }, []);

    useEffect(() => {
        // { passive: true } mencegah browser menunggu handler sebelum scroll
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    return progress;
}

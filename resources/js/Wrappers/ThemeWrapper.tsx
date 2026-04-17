/**
 * @file Wrappers/ThemeWrapper.tsx
 *
 * Penyedia konteks tema global untuk seluruh aplikasi frontend.
 *
 * Mengelola state tema (Light / Dark / System), menyinkronkannya dengan
 * localStorage dan class HTML, serta membagikan nilai konteks ke semua
 * komponen turunan melalui ThemeContext.
 */

import ThemeContext from "@/Context/ThemeContext";
import { Theme } from "@/Types/Enums";
import type { LayoutProps } from "@/Types/Types";
import { type FC, useEffect, useMemo, useState } from "react";

/**
 * Mendeteksi apakah preferensi warna sistem pengguna adalah mode gelap.
 *
 * Menggunakan Media Query `prefers-color-scheme: dark`. Mengembalikan `false`
 * secara aman jika dijalankan di lingkungan server (SSR) tanpa objek `window`.
 *
 * @returns `true` jika sistem menggunakan mode gelap, `false` jika tidak
 */
const systemIsDark = () => {
    if (typeof window === "undefined") {
        return false;
    }

    return window?.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * Abstraksi tipis di atas localStorage agar aman digunakan di SSR.
 *
 * Semua akses ke localStorage dibungkus dengan pengecekan `typeof window`
 * untuk menghindari error "window is not defined" saat server-side rendering.
 */
const localStorageHandler = {
    /**
     * Mengambil nilai dari localStorage berdasarkan kunci.
     *
     * @param key - Kunci yang ingin dibaca
     * @returns Nilai string yang tersimpan, atau `null` jika tidak ada / SSR
     */
    get: (key: string) => {
        if (typeof window === "undefined") {
            return null;
        }

        return localStorage.getItem(key);
    },

    /**
     * Menyimpan nilai ke localStorage berdasarkan kunci.
     *
     * @param key   - Kunci penyimpanan
     * @param value - Nilai string yang ingin disimpan
     */
    set: (key: string, value: string) => {
        if (typeof window === "undefined") {
            return;
        }

        localStorage.setItem(key, value);
    },
};

/**
 * Komponen wrapper yang menyediakan manajemen tema global.
 *
 * Membungkus seluruh aplikasi dan:
 * 1. Membaca tema tersimpan dari localStorage saat pertama kali dimuat.
 * 2. Menerapkan class `dark` ke elemen `<html>` berdasarkan tema aktif.
 * 3. Menyimpan pilihan tema ke localStorage setiap kali berubah.
 * 4. Membagi state tema ke semua komponen turunan via ThemeContext.
 *
 * Siklus tema saat di-toggle: Light → Dark → System → Light → ...
 *
 * @param children - Komponen anak yang akan mendapatkan akses ke konteks tema
 */
const ThemeWrapper: FC<LayoutProps> = ({ children }) => {
    /** Kunci localStorage untuk menyimpan preferensi tema pengguna. */
    const THEME_KEY: string = "FLIRT_THEME";

    const [theme, setTheme] = useState<Theme>(() => {
        const stored = localStorageHandler.get(THEME_KEY);

        return (stored as Theme) || Theme.System;
    });

    const systemTheme = systemIsDark() ? Theme.Dark : Theme.Light;
    const isDarkMode = theme === Theme.Dark || (theme === Theme.System && systemTheme === Theme.Dark);

    /**
     * Menggilir tema ke nilai berikutnya dalam siklus Light → Dark → System.
     */
    const toggleTheme = () => {
        const nextTheme = {
            [Theme.Light]: Theme.Dark,
            [Theme.Dark]: Theme.System,
            [Theme.System]: Theme.Light,
        }[theme];

        setTheme(nextTheme);
    };

    /**
     * Efek samping: terapkan/hapus class `dark` pada `<html>` dan simpan ke localStorage
     * setiap kali tema atau preferensi sistem berubah.
     */
    useEffect(() => {
        const htmlElement = document.documentElement;

        htmlElement.classList.remove(Theme.Dark);

        if (theme === Theme.Dark || (theme === Theme.System && systemTheme === Theme.Dark)) {
            htmlElement.classList.add(Theme.Dark);
        }

        localStorageHandler.set(THEME_KEY, theme);
    }, [theme, systemTheme]);

    /**
     * Memoisasi nilai konteks untuk mencegah re-render yang tidak perlu
     * pada semua komponen yang mengonsumsi ThemeContext.
     */
    const contextValue = useMemo(
        () => ({
            theme,
            systemTheme,
            isDarkMode,
            setTheme,
            toggleTheme,
        }),
        [theme, systemTheme],
    );

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export default ThemeWrapper;

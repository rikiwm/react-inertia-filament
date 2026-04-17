import ThemeContext from "@/Context/ThemeContext";
import { useContext } from "react";

/**
 * Hook untuk mengakses konteks tema (theme) dari komponen manapun di dalam ThemeWrapper.
 *
 * Mengembalikan nilai konteks yang berisi tema saat ini, status dark mode,
 * fungsi pengubah tema, dan fungsi toggle siklus tema. Melempar error jika
 * digunakan di luar `ThemeWrapper` untuk mencegah bug yang sulit dilacak.
 *
 * @returns Nilai konteks tema yang berisi: `theme`, `isDarkMode`, `setTheme`, `toggleTheme`
 * @throws Error jika hook digunakan di luar `ThemeWrapper`
 *
 * @example
 * const { isDarkMode, toggleTheme } = useTheme();
 */
const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme harus digunakan di dalam ThemeWrapper");
    }
    return context;
};

export default useTheme;


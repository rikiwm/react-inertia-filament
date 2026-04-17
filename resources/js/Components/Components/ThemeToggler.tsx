/**
 * @file Components/Components/ThemeToggler.tsx
 *
 * Tombol toggle tema yang bersepeda melalui tiga mode: Light → Dark → System.
 *
 * Menampilkan ikon yang berbeda untuk setiap mode:
 * - Light: ikon matahari (Sun)
 * - Dark: ikon bulan (Moon)
 * - System: ikon laptop (LaptopMinimal)
 */

import useTheme from "@/Hooks/useTheme";
import { Theme } from "@/Types/Enums";
import { LaptopMinimal, Moon, Sun } from "lucide-react";

/**
 * Komponen ikon interaktif untuk menggilir tema aplikasi.
 *
 * Membaca tema saat ini dari konteks dan merender ikon yang sesuai.
 * Klik pada ikon akan beralih ke tema berikutnya dalam siklus tiga-tahap.
 *
 * Siklus: Light (☀️) → Dark (🌙) → System (💻) → Light (☀️) → ...
 *
 * @param props.className - Class CSS tambahan yang diterapkan pada ikon (ukuran, warna, dll.)
 *
 * @example
 * <ThemeToggler className="w-5 h-5 text-neutral-600 cursor-pointer" />
 */
const ThemeToggler = (props: { className?: string }) => {
    const { className } = props;
    const { setTheme, theme } = useTheme();

    switch (theme) {
        /** Mode terang aktif → klik untuk beralih ke mode gelap */
        case Theme.Light:
            return <Sun className={className} onClick={() => setTheme(Theme.Dark)} />;
        /** Mode gelap aktif → klik untuk beralih ke mode sistem */
        case Theme.Dark:
            return <Moon className={className} onClick={() => setTheme(Theme.System)} />;
        /** Mode sistem aktif (atau default) → klik untuk beralih ke mode terang */
        default:
            return <LaptopMinimal className={className} onClick={() => setTheme(Theme.Light)} />;
    }
};

export default ThemeToggler;

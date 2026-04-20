/**
 * @file Components/Shared/Navbar.tsx
 *
 * Navigasi utama yang dipasang secara fixed di bagian atas halaman.
 *
 * Fitur:
 * - Animasi masuk dari atas dengan background yang muncul secara bertahap
 * - Backdrop blur berbeda untuk mode terang dan gelap
 * - Logo dinamis dari pengaturan situs (atau teks nama aplikasi sebagai fallback)
 * - Tautan navigasi ke halaman Berita dan Contact Us
 * - Tombol toggle tema (Light/Dark/System)
 */

import ThemeToggler from "@/Components/Components/ThemeToggler";
import useTheme from "@/Hooks/useTheme";
import { cn } from "@/Lib/Utils";
import { SharedData } from "@/Types/Types";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Link, usePage } from "@inertiajs/react";
import { motion } from "motion/react";
import { route } from "ziggy-js";

/**
 * Komponen navigasi utama aplikasi.
 *
 * Merender navbar floating yang:
 * 1. Mengambil `siteSettings` dari Inertia shared data untuk logo/nama aplikasi.
 * 2. Menyesuaikan warna background animasi berdasarkan mode tema aktif.
 * 3. Menampilkan logo gambar jika tersedia, atau nama aplikasi sebagai teks gradien.
 *
 * Navbar menggunakan animasi Framer Motion:
 * - Initial: transparan, sedikit di atas posisi akhir (y: -20)
 * - Animate: background blur muncul, bergerak ke posisi (y: 0)
 */
const Navbar = () => {
    const { siteSettings, menus } = usePage<SharedData>().props;

    /** Nama aplikasi dari variabel lingkungan, dengan fallback ke "FLIRT Kit". */
    const appName = import.meta.env.VITE_APP_NAME || "PDG Kit";
    const { isDarkMode } = useTheme();

    /** Tautan repositori GitHub yang ditampilkan di pojok kanan navbar. */
    const githubLink = "https://github.com/rikimukhra/vue-filament";

    /** Class CSS bersama untuk ikon-ikon interaktif di navbar. */
    const iconClass = "cursor-pointer text-teal-800 dark:text-teal-300 h-5";

    /** True jika logo gambar tersedia dari pengaturan situs. */
    const hasLogo = siteSettings.logo && siteSettings.logo !== "";

    return (
        <motion.div
            className={cn(
                "shadow-input fixed lg:inset-x-4 inset-x-4 top-3 z-10 mx-auto max-w-7xl rounded-full lg:top-2",
                "flex items-center justify-between space-x-4 bg-black/50 px-6 py-2 lg:py-2",
                "border-1 border-teal-400/50 dark:border-teal-700/60",
            )}
            initial={{
                y: -20,
                backgroundColor: "rgba(0, 0, 0, 0)",
                backdropFilter: "blur(0px)",
                WebkitBackdropFilter: "blur(0px)",
            }}
            animate={
                isDarkMode
                    ? {
                        /* Mode gelap: background hitam semi-transparan */
                        y: 0,
                        backgroundColor: "#00000050",
                        backdropFilter: "blur(4px)",
                        WebkitBackdropFilter: "blur(4px)",
                    }
                    : {
                        /* Mode terang: background putih semi-transparan */
                        y: 0,
                        backgroundColor: "#00cbc418",
                        backdropFilter: "blur(4px)",
                        WebkitBackdropFilter: "blur(4px)",
                    }
            }
            transition={{ duration: 0.2 }}
        >
            {/* Logo / nama aplikasi — mengarah ke halaman utama */}
            <Link href={route("landing-page")} className="flex items-center gap-3" prefetch cacheFor={60}>
                {hasLogo ? (
                    <img src={siteSettings.logo} alt={siteSettings.name ?? appName} className="max-h-16 max-w-full object-cover" />
                ) : (
                    <h1
                        className={cn(
                            "relative bg-gradient-to-tr font-bold text-transparent",
                            "select-none",
                            "text-xl md:text-2xl lg:text-xl",
                            "from-neutral-700 to-teal-400 bg-clip-text",
                            "dark:from-neutral-400 dark:to-neutral-700",
                        )}
                    >
                        {siteSettings.name ?? appName}
                    </h1>
                )}
            </Link>

            {/* Grup tautan navigasi kanan */}
            <div className="flex flex-row items-center justify-end gap-2 lg:gap-5">
                {/* Tautan Menu Dinamis */}
                {menus.map((item) => (
                    <Link
                        key={item.id}
                        href={item.resolved_url || item.url || "#"}
                        target={item.target}
                        className="text-black dark:text-teal-400/60 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200"
                        prefetch
                        cacheFor={60}
                    >
                        {item.title}
                    </Link>
                ))}

                {/* Tautan GitHub eksternal */}
                {/* <a href={githubLink} target="_blank" rel="noopener noreferrer" className="ml-8">
                    <SiGithub className={iconClass} />
                </a> */}

                {/* Toggle tema Light/Dark/System */}
                <ThemeToggler className={iconClass} />
            </div>
        </motion.div>
    );
};

export default Navbar;

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
import { Button } from "@/Components/UI/Button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/Components/UI/NavigationMenu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/Components/UI/Sheet";
import useTheme from "@/Hooks/useTheme";
import { cn } from "@/Lib/Utils";
import { SharedData } from "@/Types/Types";
import { Link, usePage } from "@inertiajs/react";
import { Menu } from "lucide-react";
import { motion } from "motion/react";
import { route } from "ziggy-js";

/**
 * Komponen navigasi utama aplikasi.
 *
 * Merender navbar floating yang:
 * 1. Mengambil `siteSettings` dari Inertia shared data untuk logo/nama aplikasi.
 * 2. Menyesuaikan warna background animasi berdasarkan mode tema aktif.
 * 3. Menampilkan logo gambar jika tersedia, atau nama aplikasi sebagai teks gradien.
 * 4. Responsif: Desktop menggunakan NavigationMenu, Mobile menggunakan Sheet/Drawer.
 *
 * Navbar menggunakan animasi Framer Motion:
 * - Initial: transparan, sedikit di atas posisi akhir (y: -20)
 * - Animate: background blur muncul, bergerak ke posisi (y: 0)
 */
const Navbar = () => {
    const { siteSettings, menus } = usePage<SharedData>().props;

    /** Nama aplikasi dari variabel lingkungan, dengan fallback ke "PDG Kit". */
    const appName = import.meta.env.VITE_APP_NAME || "PDG Kit";
    const { isDarkMode } = useTheme();

    /** Class CSS bersama untuk ikon-ikon interaktif di navbar. */
    const iconClass = "cursor-pointer text-teal-800 dark:text-teal-300 h-5";

    /** True jika logo gambar tersedia dari pengaturan situs. */
    const hasLogo = siteSettings.logo && siteSettings.logo !== "";

    return (
        <motion.div
            className={cn(
                "shadow-input fixed lg:inset-x-4 inset-x-2 top-1.5 z-20 mx-auto max-w-7xl rounded-full lg:top-2.5",
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
            <Link href={route("landing-page")} className="flex items-center gap-2" prefetch cacheFor={60}>
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

            {/* Desktop Navigation */}
            <div className="hidden lg:flex flex-row items-center justify-center flex-1">
                <NavigationMenu>
                    <NavigationMenuList>
                        {menus.map((item) => (
                            <NavigationMenuItem key={item.id}>
                                {item.children && item.children.length > 0 ? (
                                    <>
                                        <NavigationMenuTrigger
                                            className={cn(
                                                "bg-transparent hover:bg-teal-500/10 focus:bg-teal-500/10 transition-colors font-semibold",
                                                "text-black dark:text-teal-400/60 hover:text-teal-600 dark:hover:text-teal-400"
                                            )}
                                        >
                                            {item.title}
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent className="">
                                            <ul className="grid w-[400px] gap-3 p-2 md:grid-cols-2 bg-white/10">
                                                {item.children.map((child) => (
                                                    <li key={child.id}>
                                                        <NavigationMenuLink asChild>
                                                            <Link
                                                                href={child.resolved_url || child.url || "#"}
                                                                target={child.target}
                                                                className={cn(
                                                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
                                                                    "hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400",
                                                                    "text-md font-medium text-black dark:text-teal-400/80"
                                                                )}
                                                                prefetch
                                                                cacheFor={60}
                                                            >
                                                                {child.title}
                                                            </Link>
                                                        </NavigationMenuLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        </NavigationMenuContent>
                                    </>
                                ) : (
                                    <NavigationMenuLink asChild>
                                        <Link
                                            href={item.resolved_url || item.url || "#"}
                                            target={item.target}
                                            prefetch
                                            cacheFor={60}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                "bg-transparent hover:bg-teal-500/10 focus:bg-teal-500/10 transition-colors ",
                                                "text-black dark:text-teal-400/60 hover:text-teal-600 dark:hover:text-teal-400"
                                            )}
                                        >
                                            {item.title}
                                        </Link>
                                    </NavigationMenuLink>
                                )}
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            {/* Right Actions (Mobile Menu + Theme Toggler) */}
            <div className="flex flex-row items-center justify-center gap-2 lg:gap-5 transition-colors duration-300">
                {/* Toggle tema Light/Dark/System (Always visible) */}
                <ThemeToggler className={iconClass} />

                {/* Mobile Menu Trigger */}

                {/* <motion.div>

                    <div className="lg:hidden transition-colors duration-300">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-teal-800 dark:text-teal-300 hover:bg-teal-500/10 rounded-full">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="top" className="w-full border-teal-400/20 dark:border-teal-700/40 bg-white/80 dark:bg-black/80 backdrop-blur-md transition-all">
                                <SheetHeader className="text-left">
                                    <SheetTitle className="text-teal-800 dark:text-teal-400">Navigation Menu</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-2 mt-8 overflow-y-auto max-h-[80vh]">
                                    {menus.map((item) => (
                                        <div key={item.id} className="flex flex-col gap-2">
                                            <Link
                                                href={item.resolved_url || item.url || "#"}
                                                target={item.target}
                                                className={cn(
                                                    "text-lg font-medium transition-colors transition-all",
                                                    "text-black dark:text-teal-400/80 hover:text-teal-600 dark:hover:text-teal-400"
                                                )}
                                                prefetch
                                                cacheFor={60}
                                            >
                                                {item.title}
                                            </Link>
                                            {item.children && item.children.length > 0 && (
                                                <div className="flex flex-col gap-2 ml-4 border-l border-teal-500/20 pl-4 py-1">
                                                    {item.children.map((child) => (
                                                        <Link
                                                            key={child.id}
                                                            href={child.resolved_url || child.url || "#"}
                                                            target={child.target}
                                                            className={cn(
                                                                " font-medium transition-colors",
                                                                "text-neutral-600 dark:text-teal-400/50 hover:text-teal-600 dark:hover:text-teal-400"
                                                            )}
                                                            prefetch
                                                            cacheFor={60}
                                                        >
                                                            {child.title}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </motion.div> */}

            </div>
        </motion.div>
    );
};

export default Navbar;

/**
 * @file Wrappers/FrontWrapper.tsx
 *
 * Layout shell utama untuk semua halaman publik (frontend).
 *
 * Membungkus setiap halaman publik dengan:
 * - Manajemen tema (ThemeWrapper)
 * - Tag `<head>` dengan judul halaman dinamis
 * - Container notifikasi toast
 * - Navbar navigasi atas
 * - Grid background dekoratif
 * - Floating dock media sosial
 */

import FloatingSocialMedia from "@/Components/Shared/FloatingSocialMedia";
import Navbar from "@/Components/Shared/Navbar";
import BottomNavigation from "@/Components/Shared/BottomNavigation";
import Footer from "@/Components/Shared/Footer";
import { cn } from "@/Lib/Utils";
import { LayoutProps } from "@/Types/Types";
import ThemeWrapper from "@/Wrappers/ThemeWrapper";
import { Head } from "@inertiajs/react";
import { FC } from "react";
import { Bounce, ToastContainer } from "react-toastify";

/**
 * Wrapper layout untuk halaman-halaman publik.
 *
 * Digunakan sebagai properti `.layout` pada komponen halaman Inertia
 * agar layout tidak di-unmount dan di-remount setiap kali navigasi.
 * Ini mempertahankan state ThemeContext dan mencegah flash tema (FOUC).
 *
 * Struktur render:
 * ```
 * ThemeWrapper
 *   ├── <Head title={title} />       ← judul tab browser
 *   ├── <ToastContainer />           ← sistem notifikasi
 *   ├── <Navbar />                   ← navigasi atas fixed
 *   ├── <div> background grid        ← wrapper konten utama
 *   │     └── <div> max-width
 *   │           └── {children}       ← konten halaman
 *   └── <FloatingSocialMedia />      ← dock media sosial
 * ```
 *
 * @param props.children - Konten halaman yang akan dirender di dalam layout
 * @param props.title    - Judul halaman untuk tag `<title>` HTML (opsional)
 *
 * @example
 * // Penggunaan di komponen halaman Inertia:
 * NewsPage.layout = (page: ReactNode) => (
 *   <FrontWrapper title="Berita">{page}</FrontWrapper>
 * );
 */
const FrontWrapper: FC<LayoutProps> = (props) => {
    const { children, title } = props;

    return (
        <ThemeWrapper>
            {/* Judul halaman dinamis untuk SEO dan tab browser */}
            <Head title={title} />

            {/* Container untuk notifikasi toast (sukses, error, info) */}
            <ToastContainer
                position="bottom-center"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover
                theme="dark"
                transition={Bounce}
            />

            {/* Navigasi utama fixed di bagian atas */}
            <Navbar />

            {/* Wrapper konten dengan latar grid dekoratif */}
            <div
                className={cn(
                    "w-screen pb-32 lg:pb-0",
                    "[background-size:70px_70px]",
                    /* Mode terang: garis grid abu-abu muda */
                    "[background-image:linear-gradient(to_right,#f1f1f1_1px,transparent_1px),linear-gradient(to_bottom,#f1f1f1_1px,transparent_1px)]",
                    /* Mode gelap: garis grid abu-abu tua */
                    "dark:[background-image:linear-gradient(to_right,#181818_1px,transparent_1px),linear-gradient(to_bottom,#181818_1px,transparent_1px)]",
                )}
            >
                <div className="mx-auto max-w-screen-4xl">{children}</div>
            </div>

            {/* Navigasi utama fixed di bagian bawah untuk mobile */}
            <BottomNavigation />

            {/* Footer Modern Premium */}
            <Footer />

            {/* Floating dock media sosial di pojok bawah */}
            <FloatingSocialMedia />
        </ThemeWrapper>
    );
};

export default FrontWrapper;

/**
 * @file Components/Shared/FloatingSocialMedia.tsx
 *
 * Komponen floating dock untuk tautan media sosial yang tampil di pojok bawah halaman.
 *
 * Secara otomatis menyembunyikan diri jika tidak ada platform media sosial
 * yang dikonfigurasi di pengaturan situs, sehingga tidak memakan ruang UI
 * yang tidak diperlukan.
 */

import { FloatingDock } from "@/shared/components/ui/floating-dock";
import { filterAndReturnSocialMediaLinks } from "@/Constants/social-media";
import { SharedData } from "@/Types/types";
import { usePage } from "@inertiajs/react";

/**
 * Menampilkan dock media sosial floating di bagian bawah halaman.
 *
 * Mengambil `socialMediaSettings` dari Inertia shared data, memfilter
 * platform yang kosong/null, lalu merender FloatingDock dengan daftar
 * platform yang aktif. Jika tidak ada platform yang dikonfigurasi,
 * komponen tidak merender apapun (returns null).
 *
 * @returns Elemen floating dock, atau null jika tidak ada media sosial aktif
 *
 * @example
 * // Otomatis muncul jika ada minimal 1 platform dikonfigurasi di Filament Settings
 * <FloatingSocialMedia />
 */
const FloatingSocialMedia = () => {
    const { socialMediaSettings } = usePage<SharedData>().props;

    /** Daftar item dock yang sudah difilter (hanya platform aktif). */
    const dockItems = filterAndReturnSocialMediaLinks(socialMediaSettings);

    // Jangan render apapun jika tidak ada platform yang dikonfigurasi
    if (dockItems.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-5 z-50 mx-auto flex w-full max-w-screen-lg items-center justify-end-safe px-4 py-2 lg:inset-x-0 lg:justify-center-safe">
            <FloatingDock items={dockItems} />
        </div>
    );
};

export default FloatingSocialMedia;

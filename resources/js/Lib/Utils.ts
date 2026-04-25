import { SocialMediaIcons, SocialMediaLabels, SocialMediaPrefix } from "@/Lib/enum-constants";
import { SocialMedia } from "@/Types/enums";
import { FloatingDockItem, SocialMediaSetting } from "@/Types/types";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Menggabungkan class-class Tailwind CSS secara cerdas.
 *
 * Menggunakan `clsx` untuk menangani ekspresi kondisional dan array,
 * lalu `tailwind-merge` untuk menyelesaikan konflik class Tailwind
 * (misalnya `p-2` vs `p-4` hanya akan mengambil satu).
 *
 * @param inputs - Nilai class yang ingin digabungkan (string, array, objek kondisional)
 * @returns String class CSS yang sudah digabungkan dan dioptimalkan
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-indigo-600", "hover:bg-indigo-700")
 * // "px-4 py-2 bg-indigo-600 hover:bg-indigo-700"
 */
export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};

/**
 * Mengubah setiap kata dalam string menjadi huruf kapital di awal (Title Case).
 *
 * @param str - String yang ingin diubah formatnya
 * @returns String dengan huruf pertama setiap kata menjadi kapital
 *
 * @example
 * ucWords("hello world") // "Hello World"
 */
export const ucWords = (str: string): string => {
    return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

export const createOpdSlug = (namaOpd: string): string => {
    return namaOpd
        .toLowerCase()
        .trim()
        // Replace spaces with hyphens
        .replace(/\s+/g, "-")
        // Replace other special characters with hyphens
        .replace(/[^\w-]/g, "")
        // Replace multiple consecutive hyphens with single hyphen
        .replace(/-+/g, "-")
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, "");
}


/**
 * Memfilter dan mengonversi pengaturan media sosial menjadi daftar item dock.
 *
 * Memproses setiap entri dalam `SocialMediaSetting`, melewati platform
 * yang kosong/null, lalu memetakan sisanya ke format `FloatingDockItem`
 * yang siap digunakan oleh komponen FloatingDock.
 *
 * @param socialMedia - Objek pengaturan media sosial dari Inertia shared data
 * @returns Array item dock yang hanya berisi platform yang terkonfigurasi
 *
 * @example
 * // Input: { linkedin: "johndoe", whatsapp: null, instagram: "johndoe_ig" }
 * // Output: [{ title: "LinkedIn", icon: ..., href: "https://linkedin.com/in/johndoe" }, ...]
 */
export const filterAndReturnSocialMediaLinks = (socialMedia: SocialMediaSetting): FloatingDockItem[] => {
    return Object.entries(socialMedia)
        .filter(([, value]) => value && value.trim().length > 0)
        .map(([key, value]) => {
            const mediaKey = key as SocialMedia;
            const title = SocialMediaLabels[mediaKey];
            const prefix = SocialMediaPrefix[mediaKey];
            const icon = SocialMediaIcons[mediaKey];
            return {
                title,
                icon,
                href: prefix + value,
            };
        });
};


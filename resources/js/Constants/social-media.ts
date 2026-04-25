/**
 * @file constants/social-media.ts
 *
 * Social media configuration: labels, URL prefixes, and icons.
 * Consolidated from Lib/EnumConstants.ts and Lib/Utils.ts.
 */

import { SocialMedia } from "@/Types/enums";
import {
    IconType,
    SiFacebook,
    SiGithub,
    SiInstagram,
    SiMedium,
    SiTiktok,
    SiWhatsapp,
    SiX,
    SiYoutube,
} from "@icons-pack/react-simple-icons";
import { Linkedin } from "lucide-react";
import type { FloatingDockItem, SocialMediaSetting } from "@/Types/types";

// ─── Labels ──────────────────────────────────────────────────────────────────

export const SocialMediaLabels: Record<SocialMedia, string> = {
    [SocialMedia.LinkedIn]: "LinkedIn",
    [SocialMedia.WhatsApp]: "WhatsApp",
    [SocialMedia.X]: "X (formerly Twitter)",
    [SocialMedia.Facebook]: "Facebook",
    [SocialMedia.Instagram]: "Instagram",
    [SocialMedia.TikTok]: "TikTok",
    [SocialMedia.Medium]: "Medium",
    [SocialMedia.YouTube]: "YouTube",
    [SocialMedia.GitHub]: "GitHub",
};

// ─── URL Prefixes ────────────────────────────────────────────────────────────

export const SocialMediaPrefix: Record<SocialMedia, string> = {
    [SocialMedia.LinkedIn]: "https://www.linkedin.com/in/",
    [SocialMedia.WhatsApp]: "https://wa.me/",
    [SocialMedia.X]: "https://x.com/",
    [SocialMedia.Facebook]: "https://www.facebook.com/",
    [SocialMedia.Instagram]: "https://www.instagram.com/",
    [SocialMedia.TikTok]: "https://www.tiktok.com/@",
    [SocialMedia.Medium]: "https://medium.com/@",
    [SocialMedia.YouTube]: "https://www.youtube.com/@",
    [SocialMedia.GitHub]: "https://www.github.com/",
};

// ─── Icons ───────────────────────────────────────────────────────────────────

export const SocialMediaIcons: Record<SocialMedia, IconType> = {
    [SocialMedia.LinkedIn]: Linkedin,
    [SocialMedia.WhatsApp]: SiWhatsapp,
    [SocialMedia.X]: SiX,
    [SocialMedia.Facebook]: SiFacebook,
    [SocialMedia.Instagram]: SiInstagram,
    [SocialMedia.TikTok]: SiTiktok,
    [SocialMedia.Medium]: SiMedium,
    [SocialMedia.YouTube]: SiYoutube,
    [SocialMedia.GitHub]: SiGithub,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Memfilter dan mengonversi pengaturan media sosial menjadi daftar item dock.
 *
 * Memproses setiap entri dalam `SocialMediaSetting`, melewati platform
 * yang kosong/null, lalu memetakan sisanya ke format `FloatingDockItem`
 * yang siap digunakan oleh komponen FloatingDock.
 *
 * @param socialMedia - Objek pengaturan media sosial dari Inertia shared data
 * @returns Array item dock yang hanya berisi platform yang terkonfigurasi
 */
export const filterAndReturnSocialMediaLinks = (
    socialMedia: SocialMediaSetting,
): FloatingDockItem[] => {
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

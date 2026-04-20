import { SocialMedia } from "@/Types/Enums";
import { IconType } from "@icons-pack/react-simple-icons";
import { type ReactNode } from "react";

export interface LayoutProps {
    children: ReactNode;
    title?: string;
}

export interface MenuItemData {
    id: number;
    title: string;
    url: string | null;
    resolved_url: string | null;
    target: string;
    icon: string | null;
    type: string;
    order: number;
    enabled: boolean;
    children: MenuItemData[];
}

export interface SharedData {
    socialMediaSettings: SocialMediaSetting;
    siteSettings: SiteSetting;
    menus: MenuItemData[];

    [key: string]: unknown;
}

export type SocialMediaSetting = {
    [key in SocialMedia]: string | null;
};

export interface SiteSetting {
    name: string;
    description: string;
    logo: string;
    favicon: string;
    og_image: string;
}

export interface FloatingDockItem {
    title: string;
    icon: IconType;
    href: string;
}

// ─── News ────────────────────────────────────────────────────────────────────

export interface NewsSource {
    name: string;
    url: string;
}

export interface NewsArticle {
    title: string;
    description: string;
    content: string;
    url: string;
    image: string;
    publishedAt: string;
    source: NewsSource;
}

export interface GNewsResponse {
    totalArticles: number;
    articles: NewsArticle[];
}


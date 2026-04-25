/**
 * @file shared/types/index.ts
 *
 * Barrel export for global shared types.
 * Mirrors and extends @/Types for cleaner import paths.
 */

export type {
    LayoutProps,
    MenuItemData,
    SharedData,
    SocialMediaSetting,
    SiteSetting,
    FloatingDockItem,
    NewsSource,
    NewsArticle,
    GNewsResponse,
} from "@/Types";

export { Theme, SocialMedia } from "@/Types";
export type { ThemeContextProps } from "@/Types";
export type { InputFieldProps, TextAreaProps, ButtonProps } from "@/Types";

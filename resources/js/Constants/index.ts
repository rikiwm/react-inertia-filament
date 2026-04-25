/**
 * @file Constants/index.ts
 *
 * Barrel export for all constants.
 */

export {
    SocialMediaLabels,
    SocialMediaPrefix,
    SocialMediaIcons,
    filterAndReturnSocialMediaLinks,
} from "./social-media";

export {
    getChartData,
    KPI_CARDS,
    RECENT_TRANSACTIONS,
    ASSET_ALLOCATION,
    TIME_RANGES,
} from "./dashboard";

export type { TimeRange, ChartPoint, KpiCard, Transaction } from "./dashboard";

export {
    GNEWS_TOKEN,
    GNEWS_BASE_URL,
    ARTICLES_PER_PAGE,
    NEWS_CATEGORIES,
    CATEGORY_QUERY_MAP,
    DUMMY_ARTICLES,
    DUMMY_RELATED_ARTICLES,
} from "./news";

export type { NewsCategory } from "./news";

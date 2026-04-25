import { PbjDetailItem } from "./pbj-detail-service";

// Frontend Cache Mechanism (30 detik sesuai permintaan user)
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL_MS = 30 * 1000;

const fetchWithCache = async (url: string) => {
    const now = Date.now();
    if (cache[url] && (now - cache[url].timestamp < CACHE_TTL_MS)) {
        return cache[url].data;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();

    cache[url] = {
        data,
        timestamp: now,
    };

    return data;
};

export const pbjCatalogService = {
    fetchList: async (tahun: number): Promise<PbjDetailItem[]> => {
        return fetchWithCache(`/api/pbj-inaproc/catalog?tahun=${tahun}`);
    }
};

export const pbjTenderService = {
    fetchList: async (tahun: number): Promise<PbjDetailItem[]> => {
        return fetchWithCache(`/api/pbj-inaproc/tender?tahun=${tahun}`);
    }
};

export const pbjNonTenderService = {
    fetchList: async (tahun: number): Promise<PbjDetailItem[]> => {
        return fetchWithCache(`/api/pbj-inaproc/non-tender?tahun=${tahun}`);
    }
};

export const pbjSummaryService = {
    fetchSummary: async (tahun: number) => {
        return fetchWithCache(`/api/pbj-inaproc/summary?tahun=${tahun}`);
    }
};

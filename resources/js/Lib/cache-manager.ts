/**
 * @file lib/cache-manager.ts
 *
 * Cache manager utility untuk menyimpan data API calls dengan TTL (Time To Live).
 * Membantu mengurangi unnecessary API calls dan meningkatkan performance.
 *
 * Fitur:
 * - In-memory caching dengan TTL
 * - Automatic cache invalidation
 * - Cache key generation
 * - Cache statistics
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // milliseconds
}

class CacheManager {
    private cache = new Map<string, CacheEntry<any>>();

    /**
     * Set cache dengan TTL.
     *
     * @param key - Unique cache key
     * @param data - Data to cache
     * @param ttl - Time to live in milliseconds (default: 5 minutes)
     */
    set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }

    /**
     * Get cached data jika masih valid.
     * Otomatis delete cache jika sudah expired.
     *
     * @param key - Unique cache key
     * @returns Cached data atau null jika expired/not found
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if cache is still valid
        const isExpired = Date.now() - entry.timestamp > entry.ttl;

        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Check apakah cache key sudah ada dan valid.
     *
     * @param key - Unique cache key
     * @returns true jika valid, false jika expired/not found
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    /**
     * Delete specific cache entry.
     *
     * @param key - Unique cache key
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cache entries.
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Generate cache key dari base key dan parameters.
     *
     * @param baseKey - Base key untuk cache
     * @param params - Parameters object
     * @returns Generated cache key
     */
    generateKey(baseKey: string, params: Record<string, any> = {}): string {
        const paramStr = Object.entries(params)
            .sort()
            .map(([key, value]) => `${key}:${String(value)}`)
            .join("|");

        return paramStr ? `${baseKey}:${paramStr}` : baseKey;
    }

    /**
     * Get cache statistics untuk debugging.
     *
     * @returns Cache statistics
     */
    getStats() {
        let totalEntries = 0;
        let validEntries = 0;

        this.cache.forEach((entry) => {
            totalEntries++;
            const isValid = Date.now() - entry.timestamp <= entry.ttl;
            if (isValid) validEntries++;
        });

        return {
            totalEntries,
            validEntries,
            expiredEntries: totalEntries - validEntries,
        };
    }
}

// Export singleton instance
export const cacheManager = new CacheManager();

export default cacheManager;

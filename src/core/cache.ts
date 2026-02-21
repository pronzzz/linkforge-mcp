import { logger } from '../utils/logger.js';

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

/**
 * Basic in-memory caching layer to prevent excessive token/API usage
 * on identical semantic queries within a short timeframe.
 */
export class CacheLayer {
    private static cache: Map<string, CacheEntry<any>> = new Map();

    static async getOrFetch<T>(
        key: string,
        ttlSeconds: number,
        fetchFn: () => Promise<T>
    ): Promise<T> {
        const now = Date.now();
        const cached = this.cache.get(key);

        if (cached && cached.expiresAt > now) {
            logger.debug(`[Cache] Hit for key: ${key}`);
            return cached.data;
        }

        logger.debug(`[Cache] Miss for key: ${key}. Fetching new data...`);
        const data = await fetchFn();

        this.cache.set(key, {
            data,
            expiresAt: now + (ttlSeconds * 1000)
        });

        return data;
    }

    static clear(keyPattern?: string) {
        if (!keyPattern) {
            this.cache.clear();
            return;
        }
        // simple clear implementation
        for (const key of this.cache.keys()) {
            if (key.includes(keyPattern)) {
                this.cache.delete(key);
            }
        }
    }
}

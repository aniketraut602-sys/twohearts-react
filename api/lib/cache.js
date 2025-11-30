/**
 * In-memory cache for frequently accessed data
 * Reduces database load for 1000-50000 concurrent users
 */
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.ttl = new Map(); // Time-to-live for each key
    }

    /**
     * Set a value in cache with TTL
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttlSeconds - Time to live in seconds
     */
    set(key, value, ttlSeconds = 300) {
        this.cache.set(key, value);
        const expiresAt = Date.now() + (ttlSeconds * 1000);
        this.ttl.set(key, expiresAt);
    }

    /**
     * Get a value from cache
     * @param {string} key - Cache key
     * @returns {any|null} Cached value or null if expired/missing
     */
    get(key) {
        const expiresAt = this.ttl.get(key);

        // Check if expired
        if (!expiresAt || Date.now() > expiresAt) {
            this.delete(key);
            return null;
        }

        return this.cache.get(key);
    }

    /**
     * Delete a value from cache
     * @param {string} key - Cache key
     */
    delete(key) {
        this.cache.delete(key);
        this.ttl.delete(key);
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.ttl.clear();
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        for (const [key, expiresAt] of this.ttl.entries()) {
            if (now > expiresAt) {
                this.delete(key);
            }
        }
    }
}

// Singleton instance
const cache = new CacheManager();

// Run cleanup every 5 minutes
setInterval(() => {
    cache.cleanup();
}, 5 * 60 * 1000);

module.exports = cache;

// GeoJSON Data Caching Utility
// Provides memory-based caching with TTL for large GeoJSON datasets

interface CacheConfig {
  defaultTTL: number; // Time to live in milliseconds
  maxCacheSize: number; // Maximum cache size in bytes
  version: string; // Cache version for invalidation
}

const CACHE_CONFIG: CacheConfig = {
  defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
  maxCacheSize: 300 * 1024 * 1024, // 300MB (significantly increased)
  version: '1.0.0'
};

const CACHE_PREFIX = 'caelus_geojson_cache_';

// In-memory cache for large datasets that don't fit in localStorage
const memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

/**
 * Generate cache key for a given URL
 */
function getCacheKey(url: string): string {
  // Create a hash-like key from URL to avoid special characters
  const cleanUrl = url.replace(/[^a-zA-Z0-9]/g, '_');
  return `${CACHE_PREFIX}${cleanUrl}`;
}

/**
 * Estimate size of cached data in bytes
 */
function estimateSize(obj: any): number {
  try {
    return new Blob([JSON.stringify(obj)]).size;
  } catch {
    return 0;
  }
}

/**
 * Clean up expired memory cache entries and manage size
 */
function cleanupMemoryCache(): void {
  const now = Date.now();
  const entriesToRemove: string[] = [];
  let totalSize = 0;

  // Find expired entries and calculate total size
  memoryCache.forEach((entry, key) => {
    if (now - entry.timestamp > entry.ttl) {
      entriesToRemove.push(key);
    } else {
      totalSize += estimateSize(entry.data);
    }
  });

  // Remove expired entries
  entriesToRemove.forEach(key => memoryCache.delete(key));

  // If still over size limit, remove oldest entries
  if (totalSize > CACHE_CONFIG.maxCacheSize) {
    const sortedEntries: Array<[string, any]> = [];
    memoryCache.forEach((entry, key) => {
      if (now - entry.timestamp < entry.ttl) {
        sortedEntries.push([key, entry]);
      }
    });

    sortedEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    let sizeToRemove = totalSize - CACHE_CONFIG.maxCacheSize;
    for (const [key, entry] of sortedEntries) {
      if (sizeToRemove <= 0) break;
      memoryCache.delete(key);
      sizeToRemove -= estimateSize(entry.data);
    }
  }

  if (entriesToRemove.length > 0) {
    console.debug(`GeoJSONCache: Cleaned up ${entriesToRemove.length} expired memory cache entries`);
  }
}

/**
 * Get cached GeoJSON data
 */
export function getCachedData(url: string): any | null {
  const cacheKey = getCacheKey(url);
  const now = Date.now();

  // Check memory cache only
  const memoryEntry = memoryCache.get(cacheKey);
  if (memoryEntry) {
    if (now - memoryEntry.timestamp < memoryEntry.ttl) {
      console.debug(`GeoJSONCache: Memory cache hit for ${url}`);
      return memoryEntry.data;
    } else {
      memoryCache.delete(cacheKey);
      console.debug(`GeoJSONCache: Memory cache expired for ${url}`);
    }
  }

  return null;
}

/**
 * Cache GeoJSON data with TTL
 */
export function setCachedData(url: string, data: any, ttl?: number): void {
  const cacheKey = getCacheKey(url);
  const now = Date.now();
  const cacheTTL = ttl || CACHE_CONFIG.defaultTTL;

  // Validate data
  if (!data || typeof data !== 'object') {
    console.warn('GeoJSONCache: Invalid data provided for caching');
    return;
  }

  const featureCount = data.features?.length || 0;

  // Check cache size and manage memory
  const dataSize = estimateSize(data);
  if (dataSize > CACHE_CONFIG.maxCacheSize) {
    console.warn(`GeoJSONCache: Data too large to cache (${Math.round(dataSize / 1024 / 1024)}MB). Skipping cache for ${url}`);
    return;
  }

  // Clean up expired entries and manage size
  cleanupMemoryCache();

  // Store in memory cache
  memoryCache.set(cacheKey, {
    data,
    timestamp: now,
    ttl: cacheTTL
  });

  console.debug(`GeoJSONCache: Cached ${url} (${featureCount} features, TTL: ${cacheTTL / 1000 / 60 / 60}h, Size: ${Math.round(dataSize / 1024 / 1024)}MB)`);
}

/**
 * Remove specific cached data
 */
export function removeCachedData(url: string): void {
  const cacheKey = getCacheKey(url);

  // Remove from memory cache only
  memoryCache.delete(cacheKey);

  console.debug(`GeoJSONCache: Removed cache for ${url}`);
}

/**
 * Clear all GeoJSON cache entries
 */
export function clearGeoJsonCache(): void {
  // Clear memory cache only
  const entryCount = memoryCache.size;
  memoryCache.clear();

  console.log(`GeoJSONCache: Cleared ${entryCount} memory cache entries`);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalEntries: number;
  totalSize: number;
  oldestEntry: number | null;
  newestEntry: number | null;
} {
  let totalEntries = 0;
  let totalSize = 0;
  let oldestEntry: number | null = null;
  let newestEntry: number | null = null;
  const now = Date.now();

  memoryCache.forEach((entry) => {
    // Only count valid (non-expired) entries
    if (now - entry.timestamp < entry.ttl) {
      totalEntries++;
      totalSize += estimateSize(entry.data);

      if (oldestEntry === null || entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
      if (newestEntry === null || entry.timestamp > newestEntry) {
        newestEntry = entry.timestamp;
      }
    }
  });

  return { totalEntries, totalSize, oldestEntry, newestEntry };
}

// Initialize cache cleanup on module load
if (typeof window !== 'undefined') {
  // Run memory cache cleanup periodically
  setInterval(() => {
    cleanupMemoryCache();
  }, 60 * 60 * 1000); // Every hour

  // Run initial cleanup
  setTimeout(() => {
    cleanupMemoryCache();
  }, 5000); // After 5 seconds
}

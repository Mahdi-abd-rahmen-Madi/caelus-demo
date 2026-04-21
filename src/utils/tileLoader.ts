// src/utils/tileLoader.ts
// Unified tile loader for both OpenStreetMap and MapTiler tiles
// Handles caching, priority-based queueing, and retry logic
// NOTE: Authentication tokens must be provided by the caller

import logger from './logger';
import { MAP_CONFIG } from '../config/mapConfig';
// Performance monitoring disabled for better performance
function measureTileLoad<T>(_url: string, loadFunction: () => Promise<T>, _fromCache = false): Promise<T> {
    return loadFunction();
}

// Track MapTiler status globally
let isMaptilerOverused = false;
let maptilerFallbackHandler: ((isOverused: boolean) => void) | null = null;

// Adaptive configuration based on device capabilities
const getDeviceCapabilities = () => {
    const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const deviceMemory = (navigator as any).deviceMemory || 4;
    const connection = (navigator as any).connection;
    const isSlowConnection = connection ?
        connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' || connection.saveData :
        isMobile;

    return {
        isMobile,
        deviceMemory,
        isSlowConnection,
        maxCacheSize: Math.min(500, Math.max(100, deviceMemory * 100)),
        maxConcurrent: isSlowConnection ? 2 : (isMobile ? 3 : 4),
        batchSize: isSlowConnection ? 3 : (isMobile ? 4 : 6)
    };
};

const deviceCaps = getDeviceCapabilities();

// Configuration with adaptive values
const CONFIG = {
    MAX_OSM_CONCURRENT: deviceCaps.maxConcurrent,
    MAX_MAPTILER_CONCURRENT: deviceCaps.maxConcurrent,
    MAX_RETRIES: 3,
    REQUEST_TIMEOUT: deviceCaps.isSlowConnection ? 12000 : 8000,
    CACHE_TTL: 1000 * 60 * 60 * 24, // 24 hours
    CACHE_CLEANUP_INTERVAL: deviceCaps.isMobile ? 10 * 60 * 1000 : 15 * 60 * 1000,
    BATCH_SIZE: deviceCaps.batchSize,
    VIEWPORT_BUFFER: deviceCaps.isMobile ? 0 : 1,
    MAX_CACHE_SIZE: deviceCaps.maxCacheSize,
    CACHE_CLEANUP_SIZE: Math.floor(deviceCaps.maxCacheSize * 0.2),
};

// Request queue with priority
interface TileRequest {
    url: string;
    priority: number;
    riskPriority: number;
    retryCount: number;
    authToken: string | null;
    resolve: (value: ArrayBuffer | null) => void;
    reject: (reason?: any) => void;
    timestamp: number;
}

/**
 * Register a handler for MapTiler overuse events
 */
export function registerMaptilerFallbackHandler(handler: (isOverused: boolean) => void) {
    maptilerFallbackHandler = handler;
    if (isMaptilerOverused) {
        handler(true);
    }
}

/**
 * Check if a URL is an internal API endpoint that requires authentication
 */
function isInternalApiUrl(url: string): boolean {
    try {
        const isInternalPath = [
            '/api/',
            '/mvt/',
            '/tiles/',
            '/buildings/',
            '/solar-panels/'
        ].some(segment => url.includes(segment));

        if (isInternalPath) return true;

        const internalHosts = [
            '127.0.0.1:8000',
        ];

        const apiServer = import.meta.env.VITE_API_SERVER;
        if (apiServer) {
            const cleanServer = apiServer
                .replace(/^https?:\/\//, '')
                .replace(/\/$/, '');
            internalHosts.push(cleanServer);
        }

        return internalHosts.some(host => {
            try {
                const urlObj = new URL(url);
                return urlObj.host === host || urlObj.hostname === host;
            } catch (e) {
                return url.includes(host);
            }
        });
    } catch (error) {
        logger.error('Error checking if URL is internal:', error);
        return true;
    }
}

/**
 * Check if a URL is a MapTiler tile URL
 */
function isMaptilerUrl(url: string): boolean {
    return url.includes('api.maptiler.com');
}

/**
 * Mark MapTiler as overused and notify handlers
 */
function markMaptilerOverused() {
    if (!isMaptilerOverused) {
        isMaptilerOverused = true;
        if (maptilerFallbackHandler) {
            maptilerFallbackHandler(true);
        }
        logger.info('MapTiler is overused. Switching to OSM fallback.');
    }
}

// LRU Cache implementation for better memory management
class LRUCache<K, V> {
    private cache = new Map<K, { value: V; timestamp: number }>();
    private maxSize: number;

    constructor(maxSize: number = CONFIG.MAX_CACHE_SIZE) {
        this.maxSize = maxSize;
    }

    get(key: K): V | undefined {
        const entry = this.cache.get(key);
        if (entry) {
            // Move to end (most recently used)
            this.cache.delete(key);
            this.cache.set(key, entry);
            return entry.value;
        }
        return undefined;
    }

    set(key: K, value: V): void {
        // Remove existing entry if present
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        // Add new entry
        this.cache.set(key, { value, timestamp: Date.now() });

        // Enforce size limit
        if (this.cache.size > this.maxSize) {
            // Remove oldest entries (least recently used)
            const entriesToRemove = this.cache.size - this.maxSize;
            const keysToDelete = Array.from(this.cache.keys()).slice(0, entriesToRemove);
            keysToDelete.forEach(key => this.cache.delete(key));
        }
    }

    has(key: K): boolean {
        return this.cache.has(key);
    }

    delete(key: K): boolean {
        return this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }

    // Enhanced memory-aware cleanup
    cleanup(): number {
        const now = Date.now();
        const toDelete: K[] = [];
        const memoryPressure = this.getMemoryPressure();

        // More aggressive cleanup under memory pressure
        const ageThreshold = memoryPressure > 0.8 ?
            CONFIG.CACHE_TTL * 0.5 : // 50% of normal TTL under pressure
            CONFIG.CACHE_TTL;

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > ageThreshold) {
                toDelete.push(key);
            }
        }

        // If still under memory pressure, remove least recently used items
        if (memoryPressure > 0.8 && this.cache.size > this.maxSize * 0.5) {
            const additionalCleanup = Math.floor(this.cache.size * 0.2);
            const entries = Array.from(this.cache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

            for (let i = 0; i < Math.min(additionalCleanup, entries.length); i++) {
                if (!toDelete.includes(entries[i][0])) {
                    toDelete.push(entries[i][0]);
                }
            }
        }

        toDelete.forEach(key => this.cache.delete(key));
        return toDelete.length;
    }

    // Get memory pressure estimate (0-1 scale)
    getMemoryPressure(): number {
        if (typeof performance === 'undefined') {
            return 0.5; // Default moderate pressure
        }

        // Type assertion for performance.memory (Chrome-specific API)
        const memory = (performance as any).memory;
        if (!memory) {
            return 0.5; // Default moderate pressure
        }

        const used = memory.usedJSHeapSize;
        const total = memory.totalJSHeapSize;
        const limit = memory.jsHeapSizeLimit;

        // Calculate pressure based on both current usage and limit proximity
        const currentUsage = used / total;
        const limitProximity = used / limit;

        return Math.max(currentUsage, limitProximity);
    }

    // Enhanced cache statistics with memory monitoring
    getStats() {
        const memoryPressure = this.getMemoryPressure();
        const estimatedMemoryUsage = this.estimateMemoryUsage();

        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            memoryUsage: estimatedMemoryUsage,
            memoryPressure,
            hitRate: this.calculateHitRate(),
            efficiency: this.cache.size > 0 ? estimatedMemoryUsage / this.cache.size : 0
        };
    }

    // Estimate actual memory usage of cached items
    estimateMemoryUsage(): number {
        let totalSize = 0;
        for (const [, entry] of this.cache.entries()) {
            if (entry.value && entry.value instanceof ArrayBuffer) {
                totalSize += entry.value.byteLength;
            } else {
                // Rough estimate for other types
                totalSize += 1024; // 1KB estimate
            }
        }
        return totalSize;
    }

    // Calculate cache hit rate
    private hits = 0;
    private misses = 0;

    calculateHitRate(): number {
        const total = this.hits + this.misses;
        return total > 0 ? this.hits / total : 0;
    }

    recordHit(): void { this.hits++; }
    recordMiss(): void { this.misses++; }
}

// Tile cache with LRU implementation
const tileCache = new LRUCache<string, ArrayBuffer | null>(CONFIG.MAX_CACHE_SIZE);
const activeRequests = new Map<string, Promise<ArrayBuffer | null>>();
const requestQueue: TileRequest[] = [];
let activeOsmRequests = 0;
let activeMaptilerRequests = 0;

startCacheCleanup();

// Request queue management
function queueTile(url: string, priority = 0, riskPriority = 0, authToken: string | null = null): Promise<ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
        const request: TileRequest = {
            url,
            priority,
            riskPriority,
            retryCount: 0,
            authToken,
            resolve,
            reject,
            timestamp: Date.now()
        };

        // Calculate final priority combining spatial and risk priorities
        const finalPriority = (priority * 0.7) + (riskPriority * 0.3);

        const index = requestQueue.findIndex(r => (r.priority * 0.7 + r.riskPriority * 0.3) < finalPriority);
        if (index === -1) {
            requestQueue.push(request);
        } else {
            requestQueue.splice(index, 0, request);
        }

        processQueue();
    });
}

function processQueue(): void {
    // Separate requests by type to avoid repeated filtering
    const osmRequests: TileRequest[] = [];
    const maptilerRequests: TileRequest[] = [];

    // Categorize requests once
    requestQueue.forEach(request => {
        if (isMaptilerUrl(request.url) || isInternalApiUrl(request.url)) {
            maptilerRequests.push(request);
        } else {
            osmRequests.push(request);
        }
    });

    // Sort by final priority (higher first) - combining spatial and risk priorities
    osmRequests.sort((a, b) => {
        const finalPriorityA = (a.priority * 0.7) + (a.riskPriority * 0.3);
        const finalPriorityB = (b.priority * 0.7) + (b.riskPriority * 0.3);
        return finalPriorityB - finalPriorityA;
    });

    maptilerRequests.sort((a, b) => {
        const finalPriorityA = (a.priority * 0.7) + (a.riskPriority * 0.3);
        const finalPriorityB = (b.priority * 0.7) + (b.riskPriority * 0.3);
        return finalPriorityB - finalPriorityA;
    });

    // Process OSM requests
    while (activeOsmRequests < CONFIG.MAX_OSM_CONCURRENT && osmRequests.length > 0) {
        const next = osmRequests.shift()!;
        const index = requestQueue.indexOf(next);
        if (index >= 0) requestQueue.splice(index, 1);

        activeOsmRequests++;
        processTileRequest(next).finally(() => {
            activeOsmRequests--;
            processQueue();
        });
    }

    // Process MapTiler/internal API requests
    while (activeMaptilerRequests < CONFIG.MAX_MAPTILER_CONCURRENT && maptilerRequests.length > 0) {
        const next = maptilerRequests.shift()!;
        const index = requestQueue.indexOf(next);
        if (index >= 0) requestQueue.splice(index, 1);

        activeMaptilerRequests++;
        processTileRequest(next).finally(() => {
            activeMaptilerRequests--;
            processQueue();
        });
    }
}

async function processTileRequest(request: TileRequest): Promise<void> {
    const { url, priority, retryCount, authToken } = request;

    try {
        const cached = getFromCache(url);
        if (cached !== null) {
            request.resolve(cached);
            return;
        }

        if (activeRequests.has(url)) {
            const promise = activeRequests.get(url);
            if (promise) {
                const result = await promise;
                request.resolve(result);
                return;
            }
        }

        // Fallback to OSM if MapTiler is overused
        if (isMaptilerOverused && isMaptilerUrl(url)) {
            const match = url.match(/\/(\d+)\/(\d+)\/(\d+)\.jpg/);
            if (match) {
                const z = match[1];
                const x = match[2];
                const y = match[3];
                const osmUrl = `https://${['a', 'b', 'c'][Math.floor(Math.random() * 3)]}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
                return queueTile(osmUrl, priority, request.riskPriority, authToken).then(request.resolve).catch(request.reject);
            }
        }

        const headers: Record<string, string> = {
            'Accept': 'application/x-protobuf, image/webp, image/png, image/jpeg',
        };

        // Add auth header for internal APIs
        if (isInternalApiUrl(url)) {
            if (!authToken) {
                const errorMsg = 'Authentication required for internal API endpoint';
                logger.warn(errorMsg, { url });
                if (typeof window !== 'undefined') {
                    const authEvent = new CustomEvent('auth-required', {
                        detail: { message: errorMsg, url }
                    });
                    window.dispatchEvent(authEvent);
                }
                throw new Error(errorMsg);
            }
            headers['Authorization'] = `Bearer ${authToken}`;
            headers['X-Requested-With'] = 'XMLHttpRequest';
            headers['Cache-Control'] = 'no-cache';
        }

        if (isMaptilerUrl(url)) {
            headers['Referer'] = window.location.origin;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

        const fetchOptions: RequestInit = {
            method: 'GET',
            headers,
            credentials: isInternalApiUrl(url) ? 'include' : 'same-origin',
            signal: controller.signal,
            mode: 'cors',
            cache: 'default'
        };

        const response = await fetch(url, fetchOptions);

        clearTimeout(timeoutId);

        if (response.status === 401) {
            logger.warn('Authentication failed', { url, status: response.status });
            if (isInternalApiUrl(url)) {
                try {
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');
                    const authEvent = new CustomEvent('auth-required', { detail: { url, status: response.status } });
                    window.dispatchEvent(authEvent);
                } catch (e) {
                    logger.error('Error clearing tokens', { error: e });
                }
            }
            throw new Error('Authentication required');
        }

        if (!response.ok) {
            if (isMaptilerUrl(url) && response.status === 429) {
                markMaptilerOverused();
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        setInCache(url, arrayBuffer);
        request.resolve(arrayBuffer);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isMaptilerError = isMaptilerUrl(url) && (
            errorMessage.includes('429') ||
            errorMessage.includes('quota') ||
            errorMessage.includes('over limit') ||
            errorMessage.includes('forbidden')
        );

        if (isMaptilerError) {
            markMaptilerOverused();
        }

        if (retryCount < CONFIG.MAX_RETRIES) {
            const isAuthError = errorMessage === 'Authentication required' || errorMessage === 'Authentication failed';
            const baseDelay = isAuthError ? 2000 : 1000;
            const backoffDelay = Math.min(Math.pow(2, retryCount) * baseDelay, 30000);

            logger.warn(`Retrying tile load`, {
                url,
                attempt: `${retryCount + 1}/${CONFIG.MAX_RETRIES}`,
                delay: `${backoffDelay}ms`,
                error: errorMessage
            });

            activeRequests.delete(url);

            return new Promise<void>((resolve) => {
                setTimeout(async () => {
                    try {
                        const retryRequest = {
                            ...request,
                            retryCount: retryCount + 1,
                            authToken: isAuthError ? null : request.authToken // invalidate token on auth error
                        };
                        const finalRetryPriority = (retryRequest.priority * 0.7) + (retryRequest.riskPriority * 0.3);
                        const index = requestQueue.findIndex(r => (r.priority * 0.7 + r.riskPriority * 0.3) < finalRetryPriority);
                        if (index === -1) {
                            requestQueue.push(retryRequest);
                        } else {
                            requestQueue.splice(index, 0, retryRequest);
                        }
                        await processQueue();
                        resolve();
                    } catch (retryError) {
                        request.reject(retryError);
                        resolve();
                    }
                }, backoffDelay);
            });
        } else {
            logger.error(`Failed to load tile after ${CONFIG.MAX_RETRIES} retries`, {
                url,
                error: error instanceof Error ? error.stack : String(error)
            });
            request.reject(error);
        }
    } finally {
        activeRequests.delete(url);
    }
}

function getFromCache(url: string): ArrayBuffer | null {
    const cached = tileCache.get(url);
    if (cached !== null) {
        tileCache.recordHit();
    } else {
        tileCache.recordMiss();
    }
    return cached || null;
}

function setInCache(url: string, data: ArrayBuffer): void {
    tileCache.set(url, data);
}

function startCacheCleanup(): void {
    setInterval(() => {
        const cleaned = tileCache.cleanup();
        if (cleaned > 0) {
            logger.debug(`Cleaned up ${cleaned} expired cache entries`);
        }

        // Log cache stats periodically
        const stats = tileCache.getStats();
        if (stats.size > CONFIG.MAX_CACHE_SIZE * 0.8) {
            logger.warn(`Cache approaching size limit: ${stats.size}/${stats.maxSize}`);
        }
    }, CONFIG.CACHE_CLEANUP_INTERVAL);
}

/**
 * Load a tile with optimized concurrent loading and retry logic
 * @param url The URL of the tile to load
 * @param authToken Optional auth token for internal API endpoints
 * @param priority Priority of the request (higher = more important)
 * @param riskPriority Risk-based priority (higher = lower risk areas)
 * @returns Promise that resolves to the tile data or null if loading fails
 */
export async function loadTile(
    url: string,
    authToken: string | null = null,
    priority: number = 0,
    riskPriority: number = 0
): Promise<ArrayBuffer | null> {
    // Check if tile loader is disabled via config
    if (MAP_CONFIG.disableTileLoader) {
        logger.info('Tile loader is disabled via MAP_CONFIG, returning null');
        return Promise.resolve(null);
    }

    const cached = getFromCache(url);
    if (cached !== null) {
        return measureTileLoad(url, () => Promise.resolve(cached), true);
    }

    if (activeRequests.has(url)) {
        const promise = activeRequests.get(url);
        if (promise) {
            return promise;
        }
    }

    const request = measureTileLoad(url, () => queueTile(url, priority, riskPriority, authToken));
    activeRequests.set(url, request);

    const cleanup = () => activeRequests.delete(url);
    request.then(cleanup).catch(cleanup);

    return request;
}

/**
 * Create a cached image URL from a tile URL
 */
export async function getCachedImageUrl(tileUrl: string, authToken: string | null = null, priority: number = 0, riskPriority: number = 0): Promise<string> {
    try {
        const arrayBuffer = await loadTile(tileUrl, authToken, priority, riskPriority);
        if (!arrayBuffer) return '';

        const isJpeg = tileUrl.includes('.jpg') || isMaptilerUrl(tileUrl);
        const mimeType = isJpeg ? 'image/jpeg' : 'image/png';
        const blob = new Blob([arrayBuffer], { type: mimeType });
        const imageUrl = URL.createObjectURL(blob);
        imageUrlCache.set(tileUrl, imageUrl);
        return imageUrl;
    } catch (error) {
        logger.error('Error creating image URL:', error);
        return '';
    }
}

const imageUrlCache = new Map<string, string>();

export function revokeImageUrl(url: string) {
    if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
}

export function clearTileCache(): void {
    imageUrlCache.forEach(url => {
        if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    });
    tileCache.clear();
    activeRequests.clear();
    imageUrlCache.clear();
    requestQueue.length = 0;
    activeOsmRequests = 0;
    activeMaptilerRequests = 0;

    logger.info('Tile cache cleared');
}

export async function preloadTiles(urls: string[], authToken: string | null = null): Promise<void> {
    // Check if tile loader is disabled via config
    if (MAP_CONFIG.disableTileLoader) {
        logger.info('Tile loader is disabled via MAP_CONFIG, skipping preload');
        return;
    }

    const results = await Promise.allSettled(urls.map(url => loadTile(url, authToken)));
    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
        logger.warn(`Failed to preload ${failed.length} out of ${urls.length} tiles`);
    }
}

// --- Tile Utilities ---
function isHighDPIDevice(): boolean {
    return typeof window !== 'undefined' && window.devicePixelRatio > 1;
}

function isMobileDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isSlowConnection(): boolean {
    if (typeof navigator === 'undefined') return false;
    const connection = (navigator as any).connection;
    if (connection) {
        return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' || connection.saveData;
    }
    return isMobileDevice();
}

function getOsmTileServers(): string[] {
    return [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
    ];
}

function getTileServerConfig(urlTemplate: string): {
    baseUrls: string[];
    gridSize: number;
    isHighDPI: boolean;
    isMaptiler: boolean;
} {
    const isMobile = isMobileDevice();
    const isSlow = isSlowConnection();
    const isHighDPI = isHighDPIDevice();
    const isMaptiler = urlTemplate.includes('maptiler');
    let baseUrls = isMaptiler
        ? [urlTemplate]
        : getOsmTileServers().slice(0, isMobile || isSlow ? 2 : 3);

    const gridSize = isMobile ? 1 : (isMaptiler ? 2 : 1);
    return { baseUrls, gridSize, isHighDPI, isMaptiler };
}

function lngLatToTile(lng: number, lat: number, zoom: number): { x: number; y: number; z: number } {
    const latRad = (lat * Math.PI) / 180;
    const n = Math.pow(2, zoom);
    const x = Math.floor((lng + 180) / 360 * n);
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
    return { x, y, z: Math.floor(zoom) };
}

export async function preloadTilesForViewport(
    center: { lng: number; lat: number },
    zoom: number,
    authToken: string | null = null,
    isMaptiler = false
): Promise<void> {
    // Check if tile loader is disabled via config
    if (MAP_CONFIG.disableTileLoader) {
        logger.info('Tile loader is disabled via MAP_CONFIG, skipping viewport preload');
        return;
    }
    const apiKey = import.meta.env.VITE_MAPTILER_API_KEY || '';
    const urlTemplate = isMaptiler
        ? `https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}.jpg?key=${apiKey}`
        : '{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const config = getTileServerConfig(urlTemplate);
    const { x, y, z } = lngLatToTile(center.lng, center.lat, zoom);

    const tileUrls: { url: string; priority: number }[] = [];
    // Increased grid size with viewport buffer for smoother panning
    const gridSize = config.gridSize + CONFIG.VIEWPORT_BUFFER;

    for (let dx = -gridSize; dx <= gridSize; dx++) {
        for (let dy = -gridSize; dy <= gridSize; dy++) {
            const tileX = x + dx;
            const tileY = y + dy;
            if (tileX >= 0 && tileX < Math.pow(2, z) && tileY >= 0 && tileY < Math.pow(2, z)) {
                let url: string;
                if (config.isMaptiler) {
                    url = urlTemplate.replace('{x}', tileX.toString()).replace('{y}', tileY.toString()).replace('{z}', z.toString());
                } else {
                    const serverIndex = (tileX + tileY) % config.baseUrls.length;
                    url = config.baseUrls[serverIndex]
                        .replace('{s}', ['a', 'b', 'c'][serverIndex])
                        .replace('{x}', tileX.toString())
                        .replace('{y}', tileY.toString())
                        .replace('{z}', z.toString());
                }
                if (config.isHighDPI && !config.isMaptiler) {
                    url += `${url.includes('?') ? '&' : '?'}dpr=${window.devicePixelRatio.toFixed(1)}`;
                }

                // Add priority based on distance from center
                const distance = Math.sqrt(dx * dx + dy * dy);
                const priority = Math.max(0, 10 - distance);

                tileUrls.push({ url, priority });
            }
        }
    }

    if (tileUrls.length > 0) {
        // Sort by priority and load in batches
        tileUrls.sort((a, b) => b.priority - a.priority);

        // Load tiles in priority batches
        for (let i = 0; i < tileUrls.length; i += CONFIG.BATCH_SIZE) {
            const batch = tileUrls.slice(i, i + CONFIG.BATCH_SIZE);
            const batchPromises = batch.map(item =>
                loadTile(item.url, authToken, item.priority)
            );
            await Promise.allSettled(batchPromises);
        }
    }
}

// ... (rest of the code remains the same)
export async function preloadInitialTiles(urls: string[], authToken: string | null = null): Promise<void> {
    // Check if tile loader is disabled via config
    if (MAP_CONFIG.disableTileLoader) {
        logger.info('Tile loader is disabled via MAP_CONFIG, skipping initial preload');
        return;
    }

    await Promise.allSettled(urls.map(url => loadTile(url, authToken)));
}

export default {
    loadTile,
    getCachedImageUrl,
    revokeImageUrl,
    clearTileCache,
    preloadTiles,
    preloadTilesForViewport,
    preloadInitialTiles,
    utils: {
        isHighDPIDevice,
        isMobileDevice,
        isSlowConnection,
        getTileServerConfig,
        getOsmTileServers,
        lngLatToTile,
        isInternalApiUrl,
        isMaptilerUrl,
        registerMaptilerFallbackHandler,
        isMaptilerOverused: () => isMaptilerOverused
    },
    cache: {
        getStats: () => tileCache.getStats(),
        cleanup: () => tileCache.cleanup()
    }
};
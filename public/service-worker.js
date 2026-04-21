// Service Worker for advanced caching and offline support
const CACHE_NAME = 'caelus-cache-v1';
const CACHE_VERSION = '1.0.0';

// Cache configuration
const CACHE_CONFIG = {
  // Static assets - cache for 1 year
  staticAssets: {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    maxEntries: 100
  },
  // API responses - cache for 1 hour
  apiResponses: {
    maxAge: 60 * 60 * 1000, // 1 hour
    maxEntries: 200
  },
  // External API responses (georisques) - cache for 30 minutes
  externalAPI: {
    maxAge: 30 * 60 * 1000, // 30 minutes
    maxEntries: 300
  },
  // Enedis API responses - cache for 15 minutes with stale-while-revalidate
  enedisAPI: {
    maxAge: 15 * 60 * 1000, // 15 minutes
    staleWhileRevalidate: 60 * 60 * 1000, // 1 hour stale while revalidate
    maxEntries: 500
  },
  // Tiles - cache for 30 minutes
  tiles: {
    maxAge: 30 * 60 * 1000, // 30 minutes
    maxEntries: 500
  }
};

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(Object.keys(CACHE_CONFIG).map(key =>
        new Request(`/offline-${key}`, { url: `/offline-${key}` })
      ));
    })
  );
});

// Fetch event with network-first, then cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different cache strategies based on URL
  let cacheStrategy = 'apiResponses';
  let maxAge = CACHE_CONFIG.apiResponses.maxAge;
  let staleWhileRevalidate = null;

  if (url.hostname.includes('opendata.enedis.fr')) {
    // Special handling for Enedis API with stale-while-revalidate
    cacheStrategy = 'enedisAPI';
    maxAge = CACHE_CONFIG.enedisAPI.maxAge;
    staleWhileRevalidate = CACHE_CONFIG.enedisAPI.staleWhileRevalidate;
  } else if (url.hostname.includes('georisques.gouv.fr')) {
    // Special handling for external georisques API
    cacheStrategy = 'externalAPI';
    maxAge = CACHE_CONFIG.externalAPI.maxAge;
  } else if (url.hostname.includes('tile.openstreetmap.org') || url.pathname.match(/^\/\d+\/\d+\/\d+\.png$/)) {
    cacheStrategy = 'tiles';
    maxAge = CACHE_CONFIG.tiles.maxAge;
  } else if (url.pathname.includes('/static/')) {
    cacheStrategy = 'staticAssets';
    maxAge = CACHE_CONFIG.staticAssets.maxAge;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(request).then(cachedResponse => {
        const isFresh = cachedResponse && !isStale(cachedResponse, maxAge);
        const isStaleButValid = cachedResponse && staleWhileRevalidate && !isStale(cachedResponse, maxAge + staleWhileRevalidate);

        // Return fresh cached response if available
        if (isFresh) {
          return cachedResponse;
        }

        // For Enedis API, return stale data while revalidating in background
        if (isStaleButValid && cacheStrategy === 'enedisAPI') {
          // Revalidate in background
          fetchAndCache(request, cache, cacheStrategy);
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetchAndCache(request, cache, cacheStrategy).then(networkResponse => {
          return networkResponse;
        }).catch(error => {
          // Network failed, try to return stale cache if available
          if (cachedResponse) {
            return cachedResponse;
          }

          // If no cache and network failed, throw error
          throw error;
        });
      });
    })
  );
});

// Helper functions
function fetchAndCache(request, cache, cacheStrategy) {
  return fetch(request).then(networkResponse => {
    const response = networkResponse.clone();

    // Cache successful responses
    if (networkResponse.ok && (cacheStrategy === 'apiResponses' || cacheStrategy === 'externalAPI' || cacheStrategy === 'enedisAPI' || cacheStrategy === 'tiles')) {
      const cacheKey = generateCacheKey(request);
      cache.put(cacheKey, response.clone());
    }

    return networkResponse;
  });
}

function generateCacheKey(request) {
  const url = new URL(request.url);
  return `${url.pathname}${url.search}`;
}

function isStale(response, maxAge) {
  const date = response.headers.get('date');
  if (!date) return true;

  const responseDate = new Date(date);
  const now = Date.now();
  return (now - responseDate.getTime()) > maxAge;
}

// Cache cleanup on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.keys().then(keys => {
        const expiredKeys = keys.map(key =>
          cache.match(key).then(response => {
            if (response && isStale(response, CACHE_CONFIG.tiles.maxAge)) {
              return key;
            }
            return null;
          })
        ).filter(Boolean);

        if (expiredKeys.length > 0) {
          return Promise.all(expiredKeys.map(key => cache.delete(key)));
        }
      });
    })
  );
});

// Message handling for cache management
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      caches.open(CACHE_NAME).then(cache => {
        return cache.keys().then(keys =>
          Promise.all(keys.map(key => cache.delete(key)))
        ).then(() => {
          self.postMessage({ type: 'CACHE_CLEARED' });
        });
      });
      break;

    default:
      break;
  }
});

// This is the "service worker" which can intercept network requests.
const CACHE_NAME = 'autofocus-cache-v4';
const RUNTIME_CACHE = 'autofocus-runtime-v4';

// Get the base URL for the current environment
// eslint-disable-next-line no-restricted-globals
const getBaseUrl = () => {
  // eslint-disable-next-line no-restricted-globals
  const origin = self.location.origin;
  
  // For GitHub Pages deployment
  if (origin.includes('github.io')) {
    return '/pwa-autofocus-app';
  }
  
  // For local development or other deployments
  return '';
};

const BASE_URL = getBaseUrl();

// Core resources that must be cached for offline functionality
const getCoreUrls = () => [
    `${BASE_URL}/`,
    `${BASE_URL}/index.html`,
    `${BASE_URL}/manifest.json`,
    `${BASE_URL}/favicon.ico`,
    `${BASE_URL}/logo192.png`,
    `${BASE_URL}/logo512.png`,
    `${BASE_URL}/offline.html`
];

// External dependencies to cache
const EXTERNAL_CACHE_URLS = [
    'https://unpkg.com/tachyons@4.12.0/css/tachyons.min.css',
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap'
];

// eslint-disable-next-line no-restricted-globals
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Installing...');
    
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        console.log('[ServiceWorker] Caching core resources');
        
        try {
          // Get core URLs for current environment
          const coreUrls = getCoreUrls();
          console.log('[ServiceWorker] Core URLs to cache:', coreUrls);
          
          // Cache core resources first
          await cache.addAll(coreUrls);
          console.log('[ServiceWorker] Core resources cached');
          
          // Cache external dependencies
          await cache.addAll(EXTERNAL_CACHE_URLS);
          console.log('[ServiceWorker] External resources cached');
          
          // Discover and cache built JS/CSS files
          const indexUrl = `${BASE_URL}/`;
          const indexResponse = await fetch(indexUrl);
          const indexText = await indexResponse.text();
          
          // Extract JS and CSS file paths from the HTML
          const jsRegex = new RegExp(`${BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/static/js/[^"]+\\.js`, 'g');
          const cssRegex = new RegExp(`${BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/static/css/[^"]+\\.css`, 'g');
          
          const jsFiles = indexText.match(jsRegex) || [];
          const cssFiles = indexText.match(cssRegex) || [];
          
          console.log('[ServiceWorker] Found JS files:', jsFiles);
          console.log('[ServiceWorker] Found CSS files:', cssFiles);
          
          // Cache discovered assets
          const assetUrls = [...jsFiles, ...cssFiles];
          if (assetUrls.length > 0) {
            await cache.addAll(assetUrls);
            console.log('[ServiceWorker] Asset files cached');
          }
          
        } catch (error) {
          console.error('[ServiceWorker] Failed to cache some resources:', error);
          // Continue with installation even if some resources fail
        }
      })()
    );
    
    // Forces the service worker to become the active service worker
    // eslint-disable-next-line no-restricted-globals
    self.skipWaiting();
});


// eslint-disable-next-line no-restricted-globals
self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activating...');
    
    event.waitUntil(
      (async () => {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const cachesToDelete = cacheNames.filter(cacheName => 
          cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
        );
        
        await Promise.all(
          cachesToDelete.map(cacheToDelete => {
            console.log('[ServiceWorker] Deleting old cache:', cacheToDelete);
            return caches.delete(cacheToDelete);
          })
        );
        
        // Take control of all clients immediately
        // eslint-disable-next-line no-restricted-globals
        await self.clients.claim();
        console.log('[ServiceWorker] Claimed all clients');
      })()
    );
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener('fetch', event => {
    // Skip cross-origin requests and non-GET requests
    // eslint-disable-next-line no-restricted-globals
    if (!event.request.url.startsWith(self.location.origin) && 
        !event.request.url.includes('fonts.googleapis.com') &&
        !event.request.url.includes('unpkg.com')) {
        return;
    }
    
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        (async () => {
            // Check cache first (Cache First strategy for better offline support)
            const cachedResponse = await caches.match(event.request);
            
            if (cachedResponse) {
                console.log('[ServiceWorker] Found in cache:', event.request.url);
                return cachedResponse;
            }
            
            // If not in cache, try network
            try {
                console.log('[ServiceWorker] Fetching from network:', event.request.url);
                const networkResponse = await fetch(event.request);
                
                // Cache successful responses
                if (networkResponse.status === 200) {
                    const cache = await caches.open(RUNTIME_CACHE);
                    cache.put(event.request, networkResponse.clone());
                }
                
                return networkResponse;
            } catch (error) {
                console.log('[ServiceWorker] Network fetch failed:', error);
                
                // For navigation requests, return cached index.html as fallback
                if (event.request.mode === 'navigate') {
                    console.log('[ServiceWorker] Navigation request, trying fallbacks...');
                    
                    // Try to get the cached index.html
                    const indexFallback = await caches.match(`${BASE_URL}/index.html`) || 
                                         await caches.match(`${BASE_URL}/`) ||
                                         await caches.match('/index.html') ||
                                         await caches.match('/');
                    
                    if (indexFallback) {
                        console.log('[ServiceWorker] Serving cached index.html as fallback');
                        return indexFallback;
                    }
                    
                    // If no index.html, try offline page
                    const offlineFallback = await caches.match(`${BASE_URL}/offline.html`) ||
                                          await caches.match('/offline.html');
                    
                    if (offlineFallback) {
                        console.log('[ServiceWorker] Serving offline.html as fallback');
                        return offlineFallback;
                    }
                }
                
                // For other requests, throw the error
                throw error;
            }
        })()
    );
});
 
// This is the "service worker" which can intercept network requests.
const CACHE_NAME = 'autofocus-cache-v2';
const RUNTIME_CACHE = 'autofocus-runtime-v2';

// Critical resources that must be cached for offline functionality
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/logo192.png',
    '/logo512.png',
    '/static/js/bundle.js',
    '/static/css/main.css',
    // Add fallback for external dependencies
    'https://unpkg.com/tachyons@4.12.0/css/tachyons.min.css',
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap'
];

// eslint-disable-next-line no-restricted-globals
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Installing...');
    
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        console.log('[ServiceWorker] Caching app shell and content');
        
        // Cache core resources first
        try {
          await cache.addAll(PRECACHE_URLS);
          console.log('[ServiceWorker] All resources cached successfully');
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
                    const fallback = await caches.match('/index.html');
                    if (fallback) {
                        return fallback;
                    }
                }
                
                // For other requests, throw the error
                throw error;
            }
        })()
    );
});
 
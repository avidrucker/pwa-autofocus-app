// This is the "service worker" which can intercept network requests.
const URLs_TO_CACHE = [
    `${process.env.PUBLIC_URL}/`,
    `${process.env.PUBLIC_URL}/index.html`,
    `${process.env.PUBLIC_URL}/manifest.json`,
    // Add other URLs, e.g., stylesheets, scripts, images, etc.
  ];

// A unique identifier for this version of the service worker.
// Updating this will cause the service worker to re-install and bypass any cached assets.
const CACHE_NAME = 'my-cache-v1';

// eslint-disable-next-line no-restricted-globals
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Installed');
    
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(URLs_TO_CACHE);
      })
    );
    
    // Forces the service worker to become the active service worker
    // eslint-disable-next-line no-restricted-globals
    event.waitUntil(self.skipWaiting());
  });


// self.addEventListener('activate', event => {
//   console.log('[ServiceWorker] Activated');
//   // Claim the client so that the current page is controlled by the service worker immediately.
//   event.waitUntil(self.clients.claim());
// });
// eslint-disable-next-line no-restricted-globals
self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activated');
    
    const currentCaches = [CACHE_NAME];
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      }).then(cachesToDelete => {
        return Promise.all(cachesToDelete.map(cacheToDelete => {
          return caches.delete(cacheToDelete);
        }));
        // eslint-disable-next-line no-restricted-globals
      }).then(() => self.clients.claim())
    );
  });

// eslint-disable-next-line no-restricted-globals
self.addEventListener('fetch', event => {
    event.respondWith(
      // Try the network first
      fetch(event.request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          // Cache the response after fetching
          cache.put(event.request, response.clone());
          return response;
        });
      }).catch(err => {
        console.log('[ServiceWorker] Fetch failed; returning offline page instead.', err);
        return caches.match(event.request);
      })
    );
  });
 
// PWA Debug utilities
export const PWADebugger = {
    // Check if app is running in standalone mode (installed)
    isStandalone: () => {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true ||
               window.location.search.includes('standalone=true');
    },

    // Check service worker status
    getServiceWorkerStatus: async () => {
        if (!('serviceWorker' in navigator)) {
            return { supported: false, status: 'not_supported' };
        }

        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            return { supported: true, status: 'not_registered' };
        }

        return {
            supported: true,
            status: 'registered',
            scope: registration.scope,
            active: !!registration.active,
            installing: !!registration.installing,
            waiting: !!registration.waiting
        };
    },

    // Check cache status
    getCacheStatus: async () => {
        if (!('caches' in window)) {
            return { supported: false };
        }

        const cacheNames = await caches.keys();
        const cacheInfo = {};
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            cacheInfo[cacheName] = {
                size: keys.length,
                urls: keys.map(req => req.url)
            };
        }

        return {
            supported: true,
            caches: cacheInfo
        };
    },

    // Test offline functionality
    testOffline: async () => {
        try {
            const response = await fetch('/manifest.json', { cache: 'only-if-cached', mode: 'same-origin' });
            return { offline_ready: response.ok };
        } catch (error) {
            return { offline_ready: false, error: error.message };
        }
    },

    // Get full PWA status
    getFullStatus: async () => {
        const [swStatus, cacheStatus, offlineStatus] = await Promise.all([
            PWADebugger.getServiceWorkerStatus(),
            PWADebugger.getCacheStatus(),
            PWADebugger.testOffline()
        ]);

        return {
            standalone: PWADebugger.isStandalone(),
            serviceWorker: swStatus,
            cache: cacheStatus,
            offline: offlineStatus,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    },

    // Log debug info to console
    logDebugInfo: async () => {
        const status = await PWADebugger.getFullStatus();
        console.group('🔧 PWA Debug Information');
        console.log('📱 Running in standalone mode:', status.standalone);
        console.log('⚙️ Service Worker:', status.serviceWorker);
        console.log('💾 Cache Status:', status.cache);
        console.log('🌐 Offline Status:', status.offline);
        console.log('🔍 User Agent:', status.userAgent);
        console.groupEnd();
        return status;
    }
};

// Auto-log debug info in development
if (process.env.NODE_ENV === 'development') {
    window.PWADebugger = PWADebugger;
    setTimeout(() => PWADebugger.logDebugInfo(), 2000);
}

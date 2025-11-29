
const CACHE_NAME = 'deep-shift-v2';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                // Cache core assets. 
                // We catch errors here to prevent one failed asset from stopping installation
                return cache.addAll(URLS_TO_CACHE).catch(err => {
                    console.warn('Failed to cache core assets on install', err);
                });
            })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    
    // Skip non-http/https (e.g. chrome-extension://)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // 1. Cache Hit: Return cached response immediately
                if (cachedResponse) {
                    // 2. Background Revalidation: Fetch new version and update cache
                    fetch(event.request).then((networkResponse) => {
                         if (networkResponse && networkResponse.status === 200) {
                             const responseToCache = networkResponse.clone();
                             caches.open(CACHE_NAME).then((cache) => {
                                 cache.put(event.request, responseToCache);
                             });
                         }
                    }).catch(() => {
                        // Network failure is fine here, we already served the cached content
                    });
                    
                    return cachedResponse;
                }

                // 3. Cache Miss: Fetch from network
                return fetch(event.request).then(
                    (response) => {
                        // Check if valid response
                        if (!response || (response.status !== 200 && response.type !== 'opaque')) {
                            return response;
                        }

                        // Clone and Cache
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                ).catch((err) => {
                    // 4. Offline Fallback: If both Cache and Network fail
                    console.error('Fetch failed:', err);
                    // You could return a custom offline.html here if desired
                });
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

const CACHE_NAME = 'notemaster-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/dark.css',
  '/js/api-client.js',
  '/js/formatter.js',
  '/js/notes-manager.js',
  '/js/theme-toggle.js',
  '/manifest.json',
  '/fonts/iAWriterMonoS-Regular.ttf',
  '/fonts/iAWriterMonoS-Bold.ttf',
  '/fonts/iAWriterMonoS-Italic.ttf',
  '/fonts/iAWriterMonoS-BoldItalic.ttf'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache).catch(err => {
                console.log('Cache addAll error:', err);
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    // For API calls, try network first, then cache
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response.ok) {
                        // Cache successful API responses
                        const clonedResponse = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, clonedResponse);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Return cached response if network fails
                    return caches.match(event.request).then((response) => {
                        return response || new Response(JSON.stringify([]), {
                            status: 200,
                            statusText: 'From Cache',
                            headers: { 'Content-Type': 'application/json' }
                        });
                    });
                })
        );
    } else {
        // For other resources, use cache first strategy
        event.respondWith(
            caches.match(event.request).then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then((response) => {
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response;
                    }
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clonedResponse);
                    });
                    return response;
                }).catch(() => {
                    if (event.request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                });
            })
        );
    }
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});
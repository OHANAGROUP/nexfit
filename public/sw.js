// Minimal Service Worker for PWA installability
const CACHE_NAME = 'nexfit-v1';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Basic core shell assets could be cached here
            return cache.addAll(['/']);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Network-first strategy for dynamic app content
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

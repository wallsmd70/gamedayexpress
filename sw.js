// ─────────────────────────────────────────────
// GameDay Express — Service Worker
// ─────────────────────────────────────────────
const CACHE_VERSION = 'gamedayexpress-v31';
const OFFLINE_PAGE  = '/index.html';

// Install: cache the core page immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/style.css',
        '/main.js',
        '/ticker.js',
        '/tracking.js',
        '/assets/logo.png'
      ]);
    })
  );
  self.skipWaiting();
});

// Activate: delete ALL old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy: Network FIRST, fall back to cache only if offline.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(cached => cached || caches.match(OFFLINE_PAGE));
      })
  );
});

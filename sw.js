// ─────────────────────────────────────────────
// GameDay Express — Service Worker
//
// HOW TO FORCE ALL USERS TO GET LATEST VERSION:
// Every time you update index.html, bump the
// version number below by 1 (v2, v3, v4 etc.)
// That's all you ever need to do.
// ─────────────────────────────────────────────
const CACHE_VERSION = 'gamedayexpress-v6';
const OFFLINE_PAGE  = '/gamedayexpress/index.html';

// Install: cache the core page immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      return cache.addAll([
        '/gamedayexpress/',
        '/gamedayexpress/index.html',
        '/gamedayexpress/manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

// Activate: delete ALL old caches so users never see stale content
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
// This means users ALWAYS get the freshest version when online.
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

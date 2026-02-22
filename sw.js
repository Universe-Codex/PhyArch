// sw.js - PhyArch NEXUS Service Worker
const CACHE_NAME = 'phyarch-nexus-v1';
const OFFLINE_URL = '/offline.html'; // optional — create this file later

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  // Add any other critical assets here (CSS, JS CDNs are not cached)
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching core assets');
      return cache.addAll(CORE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Cache-first for core assets
  if (CORE_ASSETS.some(asset => event.request.url.endsWith(asset))) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
    return;
  }

  // Network-first + fallback for everything else
  event.respondWith(
    fetch(event.request).catch(() => {
      // Optional: return offline page for HTML requests
      if (event.request.mode === 'navigate') {
        return caches.match(OFFLINE_URL);
      }
      // Or just fail silently for other resources
      return new Response('', { status: 503 });
    })
  );
});

// Optional: push notification / background sync stubs (add later if needed)
self.addEventListener('push', event => {
  console.log('[SW] Push received:', event);
});

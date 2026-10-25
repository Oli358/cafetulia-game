/* global self, caches, fetch, URL */
const CACHE_NAME = 'cafetulia-shell-v3';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((oldKey) => caches.delete(oldKey)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never cache match API routes, rooms, history, health, or Vite dev virtual modules
  if (
    url.pathname.startsWith('/rooms') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/history') ||
    url.pathname.startsWith('/health') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/apps/') ||
    url.pathname.startsWith('/packages/')
  ) {
    return;
  }

  // Navigation requests: network-first with cached shell fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/', clone));
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match('/')),
        ),
    );
    return;
  }

  // Static production assets: stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    }),
  );
});

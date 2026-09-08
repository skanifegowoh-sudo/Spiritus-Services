const VERSION = 'spiritus-pwa-20260908-2';
const CORE_CACHE = `${VERSION}-core`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const CORE = [
  '/', '/index.html', '/directory.html', '/clergy-postings.html', '/services.html',
  '/health.html', '/schools.html', '/faith-formation.html', '/choice-flame.html',
  '/announcements.html', '/contact.html', '/about.html', '/offline.html',
  '/manifest.json', '/css/styles-2026-v3.css',
  '/assets/logo.png', '/assets/app-icon-192.png', '/assets/app-icon-512.png',
  '/assets/app-icon-maskable-512.png',
  '/js/parishes-data.js', '/js/posting-2026-data.js', '/js/clergy-postings-v2.js',
  '/js/spiritus-knowledge.js', '/js/spiritus-assistant.js',
  '/js/home-enhancements-v2.js', '/js/pwa-install-v2.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    await Promise.allSettled(CORE.map(async url => {
      try {
        const response = await fetch(url, {cache: 'reload'});
        if (response && response.ok) await cache.put(url, response);
      } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => ![CORE_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (_) {
        return await caches.match(req) || await caches.match('/offline.html');
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(req);
    const network = fetch(req).then(async response => {
      if (response && response.ok) {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(req, response.clone());
      }
      return response;
    }).catch(() => null);
    return cached || await network || new Response('', {status: 504, statusText: 'Offline'});
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

const CACHE_NAME = 'cruise-dashboard-v15';

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll([
      './',
      './index.html','./itinerary.html','./floor-plan.html','./important-info.html',
      './styles.css','./app.js','./manifest.json',
      './data/itinerary.json','./data/decks.json',
      './i18n/en.json','./i18n/he.json',
      './assets/images/ship.png','./assets/images/logo.png',
      './assets/images/icons/icon-192.png','./assets/images/icons/icon-512.png'
    ]);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

// HTML: network-first; assets/data: cache-first
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.destination === 'document') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (_) {
        return (await caches.match(req)) || (await caches.match('./index.html'));
      }
    })());
  } else if (['style','script','image','manifest'].includes(req.destination) || req.url.endsWith('.json')) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (_){
        return new Response('', {status:504});
      }
    })());
  }
});

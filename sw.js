const CACHE_NAME = 'cruise-dashboard-v11';  // bump
self.addEventListener('message', (event)=>{ if(event.data?.type==='SKIP_WAITING'){ self.skipWaiting(); }});
self.addEventListener('install', (event)=>{ event.waitUntil((async()=>{
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll([
    './','./index.html','./itinerary.html','./floor-plan.html','./important-info.html',
    './styles.css','./app.js','./manifest.json',
    './assets/images/ship.png','./assets/images/logo.png',
    './assets/images/icons/icon-192.png','./assets/images/icons/icon-512.png'
  ]);
  self.skipWaiting();
})());});
self.addEventListener('activate', (event)=>{ event.waitUntil((async()=>{
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
  self.clients.claim();
})());});

// Keep fetch strategies the same (HTML network-first, others cache-first)
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.destination === 'document') {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
  } else if (['style','script','image','manifest'].includes(req.destination)) {
    event.respondWith(
      caches.match(req).then(cached =>
        cached || fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
      )
    );
  }
});

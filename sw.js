const CACHE_NAME = 'cruise-dashboard-v11';
const CORE_ASSETS = [
  "./","./index.html","./itinerary.html","./floor-plan.html","./important-info.html",
  "./styles.css","./app.js","./manifest.json",
  "./assets/images/ship.png","./assets/images/logo.png",
  "./assets/images/icons/icon-192.png","./assets/images/icons/icon-512.png"
];

self.addEventListener('message', (event)=>{ if(event.data?.type==='SKIP_WAITING'){ self.skipWaiting(); }});

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

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

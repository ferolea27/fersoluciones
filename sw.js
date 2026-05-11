const CACHE_NAME = 'fersoluciones-v1';
const ASSETS = [
  './',
  './index.html'
];

// Instalación — guarda los archivos base en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activación — borra cachés viejos automáticamente
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — red primero, caché como respaldo
// Así siempre usa la versión más nueva de GitHub
self.addEventListener('fetch', e => {
  // Solo intercepta requests del mismo origen
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Si la red responde bien, actualiza el caché
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Sin internet, usa el caché
        return caches.match(e.request);
      })
  );
});

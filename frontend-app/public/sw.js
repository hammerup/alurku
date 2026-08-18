// alurku. Service Worker — Network-First Strategy
// Versi ini memastikan setiap deploy baru langsung terlihat tanpa perlu refresh manual.

const CACHE_NAME = 'alurku-static-v1';

// Aset statis yang aman di-cache (punya content hash dari Vite)
const CACHE_EXTENSIONS = ['.png', '.jpg', '.webp', '.svg', '.woff2', '.woff', '.ttf', '.ico'];

// ── Install: langsung aktif tanpa menunggu tab lama tutup ──
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// ── Activate: klaim semua client dan bersihkan cache lama ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: Network-First untuk HTML/API, Cache-First untuk aset statis ──
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Hanya proses HTTP/HTTPS GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 1. Selalu lewatkan API dan WebSocket ke network (tidak pernah di-cache)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws/')) {
    return; // biarkan browser handle langsung
  }

  // 2. HTML navigasi (SPA routes): SELALU Network-First
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) return cachedIndex;
          return fetch('/index.html').catch(() => new Response('Offline', { status: 503, statusText: 'Offline' }));
        })
    );
    return;
  }

  // 3. Aset statis dengan hash (js, css, gambar): Cache-First
  const ext = url.pathname.match(/\.[^.]+$/)?.[0] || '';
  if (CACHE_EXTENSIONS.includes(ext) || url.pathname.match(/\/assets\//)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => new Response('', { status: 404, statusText: 'Not Found' }));
      })
    );
    return;
  }

  // 4. Semua request GET lainnya: Network-First dengan fallback cache
  event.respondWith(
    fetch(request)
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response('', { status: 404, statusText: 'Not Found' });
      })
  );
});

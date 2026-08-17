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
  const url = new URL(request.url);

  // 1. Selalu lewatkan API dan WebSocket ke network (tidak pernah di-cache)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws/')) {
    return; // biarkan browser handle langsung
  }

  // 2. HTML navigasi: SELALU Network-First
  //    Ini memastikan index.html terbaru selalu diambil setelah deploy
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // 3. Aset statis dengan hash (js, css, gambar): Cache-First
  //    Aman karena Vite ubah nama file (hash) setiap build baru
  const ext = url.pathname.match(/\.[^.]+$/)?.[0] || '';
  if (CACHE_EXTENSIONS.includes(ext) || url.pathname.match(/\/assets\//)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 4. Semua request lainnya: Network-First
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

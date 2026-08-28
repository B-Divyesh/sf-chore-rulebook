const VERSION = 'rulebook-v1.0.2';
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;
const shellFiles = ['/', '/index.html', '/offline.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png', '/assets/house-signal-480.webp', '/assets/house-signal.webp', '/assets/house-signal.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(shellFiles)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => ![SHELL, ASSETS].includes(key)).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin !== location.origin || url.pathname.includes('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone(); caches.open(SHELL).then((cache) => cache.put('/index.html', copy)); return response;
    }).catch(async () => (await caches.match('/index.html')) || (await caches.match('/offline.html'))));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then(async (response) => {
    if (response.ok) await caches.open(ASSETS).then((cache) => cache.put(request, response.clone()));
    return response;
  })));
});

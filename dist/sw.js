const CACHE = 'dayspop-v1.0.1';
const ASSETS = [
  '/',
  '/index.html',
  '/app.css',
  '/app.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/dayspop-logo.jpg'
];

// Install — cache app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache-first for assets, network-first for API
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Never cache payment/API endpoints
  if (url.pathname.startsWith('/create-checkout') ||
      url.pathname.startsWith('/verify-pro') ||
      url.pathname.startsWith('/stripe-webhook') ||
      url.pathname.startsWith('/subscribe')) {
    return;
  }

  // Cache-first for everything else
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache successful GET responses
        if (e.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback — serve cached index.html for navigation requests
      if (e.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});

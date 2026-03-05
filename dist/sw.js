const CACHE = 'dayspop-v1.0.3';
const VERSIONED = ['/app.css', '/app.js'];
const STATIC = ['/manifest.json', '/icon-192.png', '/icon-512.png', '/dayspop-logo.jpg'];
const SKIP = ['/create-checkout', '/verify-pro', '/stripe-webhook', '/subscribe'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll([...VERSIONED, ...STATIC]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (SKIP.some(p => url.pathname.startsWith(p))) return;

  // Network-first for HTML navigation (always fresh)
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    e.respondWith(
      fetch(e.request)
        .then(r => { caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for versioned/static assets
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (e.request.method === 'GET' && r.status === 200) {
          caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        }
        return r;
      });
    })
  );
});

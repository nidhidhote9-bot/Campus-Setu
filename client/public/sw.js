const CACHE_NAME = 'campussetu-static-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // RULE: Disallow offline private write operations (POST, PUT, DELETE, PATCH)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(event.request.method)) {
    if (!navigator.onLine) {
      event.respondWith(
        new Response(
          JSON.stringify({
            error: 'Offline Private Writes Disabled',
            message: 'Transaction rejected: CampusSetu security policy disables offline writes to protect student financial and academic records. Please connect to a verified campus network.',
            code: 'OFFLINE_WRITE_DISABLED'
          }),
          {
            status: 503,
            statusText: 'Service Unavailable (Offline Write Disabled)',
            headers: { 'Content-Type': 'application/json' }
          }
        )
      );
      return;
    }
    return; // Pass through to network when online
  }

  // RULE: Cache public/static assets only (JS, CSS, fonts, images)
  const isStaticAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff2?|ico|json)$/i) ||
                        url.pathname.startsWith('/assets/');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Stale-While-Revalidate: fetch in background
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // For HTML navigation requests, fallback to offline.html if disconnected
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html').then((res) => {
          return res || caches.match('/index.html');
        });
      })
    );
  }
});

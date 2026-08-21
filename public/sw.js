// Kampala Pothole Tracker Service Worker
// Enables complete offline support for citizens in low-connectivity areas across Kampala

const CACHE_NAME = 'kampala-potholes-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap'
];

// Install Event: Cache essential shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching offline application shell');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Non-critical pre-cache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing deprecated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-First with Cache Fallback for dynamic content, Cache-First for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests for standard caching (POST requests are handled via IndexedDB queue)
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle map tile requests (OpenStreetMap / CartoDB / Tile servers)
  if (url.hostname.includes('tile.openstreetmap.org') || 
      url.hostname.includes('cartocdn.com') || 
      url.hostname.includes('basemaps.cartocdn.com') ||
      url.hostname.includes('arcgisonline.com')) {
    event.respondWith(
      caches.open('kampala-map-tiles-v1').then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (e) {
          // Return transparent 1x1 png or cached fallback if network fails
          return cachedResponse || new Response('', { status: 408, statusText: 'Offline Map Tile' });
        }
      })
    );
    return;
  }

  // Handle API Requests: Network first, with fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        // Offline response for API check
        if (url.pathname === '/api/health') {
          return new Response(JSON.stringify({ status: 'offline', offlineMode: true }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({
          error: 'Network unavailable. Request queued in local device storage.',
          offline: true
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Handle HTML and App assets: Network first, falling back to cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) {
          return cached;
        }
        // Fallback to index.html for navigation requests
        if (event.request.mode === 'navigate') {
          const rootCached = await caches.match('/index.html') || await caches.match('/');
          if (rootCached) return rootCached;
        }
        return new Response('Network offline. Kampala Pothole Tracker is running in local storage mode.', {
          status: 503,
          statusText: 'Service Unavailable (Offline)'
        });
      })
  );
});

// Background Sync Event Listener
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-potholes') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'BACKGROUND_SYNC_TRIGGERED' });
        });
      })
    );
  }
});

const CACHE_NAME = 'healthflow-v1';
const RUNTIME_CACHE = 'healthflow-runtime-v1';
const IMAGE_CACHE = 'healthflow-images-v1';
const API_CACHE = 'healthflow-api-v1';

// Detect base path (GitHub Pages vs local)
const BASE_PATH = self.registration.scope.includes('Final-IHM') ? '/Final-IHM/' : '/';

// Core files to cache on install
const STATIC_ASSETS = [
  // HTML Pages
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'login.html',
  BASE_PATH + 'dashboard.html',
  BASE_PATH + 'patient-portal.html',
  BASE_PATH + 'forms.html',
  BASE_PATH + 'staff.html',
  
  // CSS Files
  BASE_PATH + 'healthflow-styles.css',
  BASE_PATH + 'styles.css',
  BASE_PATH + 'hero-header.css',
  BASE_PATH + 'hero-styles.css',
  BASE_PATH + 'chat-system.css',
  BASE_PATH + 'forma-styles.css',
  BASE_PATH + 'pwa-install-cta.css',
  BASE_PATH + 'landing-sections.css',
  BASE_PATH + 'how-it-works-responsive.css',
  
  // JavaScript Files
  BASE_PATH + 'script.js',
  BASE_PATH + 'login.js',
  BASE_PATH + 'dashboard-data.js',
  BASE_PATH + 'pwa-install.js',
  BASE_PATH + 'healthflow-script.js',
  BASE_PATH + 'hero-header.js',
  BASE_PATH + 'landing-sections.js',
  BASE_PATH + 'health-chat-features.js',
  BASE_PATH + 'facility-registration.js',
  BASE_PATH + 'user-registration.js',
  BASE_PATH + 'pwa-install-cta.js',
  BASE_PATH + 'pwa-github-pages-handler.js',
  BASE_PATH + 'subscription-upgrade-modal.js',
  BASE_PATH + 'subscription-upgrade-modal-supabase.js',
  BASE_PATH + 'n8n_gemini_response_parser.js',
  BASE_PATH + 'supabase-config.js',
  BASE_PATH + 'dashboard-enhancements.js',
  
  // Config Files
  BASE_PATH + 'manifest.json',
  
  // External CDN Resources
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css',
  'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css',
  'https://cdn.jsdelivr.net/npm/air-datepicker@3.5.3/air-datepicker.css',
  'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js',
  'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js',
  'https://cdn.jsdelivr.net/npm/air-datepicker@3.5.3/air-datepicker.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing... Base path:', BASE_PATH);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching core assets');
        // Filter to only cache local assets
        const localAssets = STATIC_ASSETS.filter(url => url.startsWith(BASE_PATH) || url.startsWith('/'));
        return cache.addAll(localAssets).catch(err => {
          console.warn('[Service Worker] Some assets failed to cache:', err);
        });
      })
      .catch(err => console.error('[Service Worker] Cache install error:', err))
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old cache versions
          if (cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE && 
              cacheName !== IMAGE_CACHE &&
              cacheName !== API_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Implement cache strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and certain protocols
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }

  // Route different types of requests to appropriate handlers
  if (request.destination === 'image') {
    event.respondWith(cacheImage(request));
  } else if (url.origin !== location.origin) {
    event.respondWith(cacheExternal(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});

// Cache first strategy for local assets
function cacheFirst(request) {
  return caches.match(request)
    .then(response => {
      if (response) {
        return response;
      }
      
      return fetch(request)
         .then(response => {
           // Cache successful responses
           if (!response || response.status !== 200 || response.type === 'error') {
             return response;
           }

           const responseToCache = response.clone();
           const cacheName = request.destination === 'script' || 
                            request.destination === 'style' 
                            ? CACHE_NAME 
                            : RUNTIME_CACHE;
           
           caches.open(cacheName)
             .then(cache => {
               cache.put(request, responseToCache);
             })
             .catch(err => console.error('[Service Worker] Cache put error:', err));

           return response;
         })
         .catch(() => {
           // Return offline fallback for navigation requests
           if (request.mode === 'navigate') {
             return caches.match(BASE_PATH + 'index.html');
           }
           return null;
         });
    });
}

// Network first strategy for external resources
function cacheExternal(request) {
  return fetch(request)
    .then(response => {
      if (!response || response.status !== 200 || response.type === 'error') {
        return response;
      }

      const responseToCache = response.clone();
      caches.open(RUNTIME_CACHE)
        .then(cache => {
          cache.put(request, responseToCache);
        })
        .catch(err => console.error('[Service Worker] Cache external error:', err));

      return response;
    })
    .catch(() => {
      return caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          // Return placeholder for failed image requests
          if (request.destination === 'image') {
            return caches.match(BASE_PATH + 'assets/images/placeholder.png');
          }
          return null;
        });
    });
}

// Image caching strategy
function cacheImage(request) {
  return caches.open(IMAGE_CACHE)
    .then(cache => {
      return cache.match(request).then(response => {
        if (response) {
          return response;
        }

        return fetch(request)
          .then(response => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            const responseToCache = response.clone();
            cache.put(request, responseToCache);
            return response;
          })
          .catch(() => {
            // Return placeholder image on network failure
            return new Response(
              '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#ddd"/></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          });
      });
    });
}

// Handle messages from client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(RUNTIME_CACHE).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    caches.open(RUNTIME_CACHE).then(cache => {
      cache.addAll(urls).catch(err => {
        console.error('[Service Worker] Failed to cache URLs:', err);
      });
    });
  }
});

// Background sync for offline actions (requires browser support)
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background sync event:', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when connection returns
function syncOfflineData() {
  return caches.open(API_CACHE)
    .then(cache => {
      return cache.keys().then(requests => {
        return Promise.all(
          requests.map(request => {
            return fetch(request).then(response => {
              if (response.ok) {
                cache.delete(request);
              }
            }).catch(err => {
              console.error('[Service Worker] Sync error:', err);
            });
          })
        );
      });
    });
}

// Push notification handler
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
   const options = {
     body: data.body || 'HealthFlow Notification',
     icon: BASE_PATH + 'assets/images/favicon.png',
     badge: BASE_PATH + 'assets/images/favicon.png',
     tag: 'healthflow-notification',
     requireInteraction: data.requireInteraction || false,
     actions: [
       { action: 'open', title: 'Open' },
       { action: 'close', title: 'Close' }
     ]
   };

  event.waitUntil(
    self.registration.showNotification(data.title || 'HealthFlow', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
     event.waitUntil(
       clients.matchAll({ type: 'window' }).then(clientList => {
         // Check if there's already a window open with the target URL
         for (let client of clientList) {
           if (client.url.includes(BASE_PATH) && 'focus' in client) {
             return client.focus();
           }
         }
         // Open new window if none exists
         if (clients.openWindow) {
           return clients.openWindow(BASE_PATH);
         }
       })
     );
   }
});

console.log('[Service Worker] Loaded and ready with BASE_PATH:', BASE_PATH);

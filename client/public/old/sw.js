// Service Worker
const CACHE_NAME = 'kaapi-cache-v1';
const IS_DEV = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
const urlsToCache = [
  '/',
  '/favicon.ico'
];

// Installation of the Service Worker
self.addEventListener('install', (event) => {
  // In development, do not cache
  if (IS_DEV) {
    console.log('Development mode - skipping cache installation');
    return self.skipWaiting();
  }
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Using cache.addAll would be preferable, but may fail if a resource is not available
        // Instead, we use Promise.allSettled to avoid complete failure
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Couldn't cache ${url}: ${err.message}`);
            })
          )
        );
      })
      .catch(err => {
        console.error('Service worker cache installation failed:', err);
      })
  );
  // Force the service worker to activate immediately
  self.skipWaiting();
});

// Activation of the Service Worker
self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  // Ensure the Service Worker takes control of all pages immediately
  event.waitUntil(self.clients.claim());
  console.log('Service Worker activated and claimed clients');
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker skipping waiting');
    self.skipWaiting();
  }
  
  // Message pour vider le cache
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('Clearing cache on request');
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    });
  }
});

// Interception of network requests
self.addEventListener('fetch', (event) => {
  // In development, avoid caching and always go to the network
  if (IS_DEV) {
    return event.respondWith(
      fetch(event.request).catch(error => {
        console.error('Fetch failed in dev mode:', error);
        throw error;
      })
    );
  }
  
  // Handle API requests
  if (event.request.url.includes('/api/')) {
    // "network first" strategy for API requests
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // "cache first" strategy for static resources
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // If found in the cache, return the cache response
          if (response) {
            return response;
          }

          // Clone the request since it can only be used once
          const fetchRequest = event.request.clone();

          return fetch(fetchRequest)
            .then((response) => {
              // Check if the response is valid
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response since it can only be used once
              const responseToCache = response.clone();

              // Only cache GET requests
              if (event.request.method === 'GET') {
                // Add the response to the cache
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
              }

              return response;
            })
            .catch(() => {
              // In case of network error, return the offline page
              if (event.request.mode === 'navigate') {
                return caches.match('/offline');
              }
              return new Response('Not found', { status: 404 });
            });
        })
    );
  }
});

// Handling push notifications
self.addEventListener('push', (event) => {
  let data = { title: 'New notification', body: 'You have a new message.' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Error parsing notification data', e);
    }
  }

  const notificationOptions = {
    body: data.body || 'You have a new message',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-96x96.png',
    data: {
      url: data.url || '/',
      receiptId: data.receiptId
    },
    vibrate: [100, 50, 100],
    actions: [
      {
        action: 'open',
        title: 'Open'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});

// Handling clicks on notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const notificationData = event.notification.data;
  const receiptId = notificationData.receiptId;
  const urlToOpen = notificationData.url || '/';

  if (event.action === 'open' || !event.action) {
    // Open the specified URL or default home page
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          // Check if a window already exists
          for (let client of windowClients) {
            if (client.url === urlToOpen && 'focus' in client) {
              client.focus();
              // Send a message to indicate that the notification was clicked
              if (receiptId) {
                client.postMessage({
                  type: 'NOTIFICATION_CLICKED',
                  receiptId: receiptId
                });
              }
              return;
            }
          }
          
          // If no window exists, open a new one
          if (clients.openWindow) {
            clients.openWindow(urlToOpen).then((windowClient) => {
              if (receiptId && windowClient) {
                // Wait for the new window to load
                setTimeout(() => {
                  windowClient.postMessage({
                    type: 'NOTIFICATION_CLICKED',
                    receiptId: receiptId
                  });
                }, 1000);
              }
            });
          }
        })
    );
  }
});

// Register the click on the notification
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    fetch('/pwa/push/resubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        oldSubscription: event.oldSubscription,
        newSubscription: event.newSubscription
      })
    })
  );
});

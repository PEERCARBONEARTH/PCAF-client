// PCAF Emissions Engine Service Worker
const CACHE_NAME = 'pcaf-engine-v1.0.0';
const STATIC_CACHE_NAME = 'pcaf-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'pcaf-dynamic-v1.0.0';

// Assets to cache immediately - minimal set for Vite builds
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/peercarbon-logo-transparent.png'
];

// API endpoints to cache with network-first strategy
const API_ENDPOINTS = [
  '/api/loans/portfolio',
  '/api/loans/analytics',
  '/api/integrations/emission-factors'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle navigation requests with network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(navigationStrategy(request));
    return;
  }

  // Default: network-first for everything else
  event.respondWith(networkFirstStrategy(request));
});

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first strategy failed:', error);
    return new Response('Offline - Asset not available', { status: 503 });
  }
}

// Network-first strategy for API calls and dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      if (request.url.includes('/api/')) {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || 
             new Response('Offline - Please check your connection', { status: 503 });
    }

    return new Response('Offline - Data not available', { status: 503 });
  }
}

// Navigation strategy for page requests
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to main app shell
    const appShell = await caches.match('/financed-emissions');
    if (appShell) {
      return appShell;
    }

    return new Response('Offline - App not available', { status: 503 });
  }
}

// Helper function to identify static assets
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => pathname.endsWith(ext)) ||
         pathname.includes('/assets/') ||
         pathname === '/manifest.json';
}

// Background sync for offline data uploads
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'portfolio-upload') {
    event.waitUntil(syncPortfolioUploads());
  }
  
  if (event.tag === 'calculation-request') {
    event.waitUntil(syncCalculationRequests());
  }
});

// Sync portfolio uploads when back online
async function syncPortfolioUploads() {
  try {
    console.log('[SW] Syncing portfolio uploads...');
    
    // Get pending uploads from IndexedDB
    const pendingUploads = await getPendingUploads();
    
    for (const upload of pendingUploads) {
      try {
        // Get API base URL from the main thread or use relative path for same-origin
        const apiBaseUrl = self.location.origin.includes('vercel.app') 
          ? 'https://pcaf-server-production.up.railway.app' 
          : '';
        const response = await fetch(`${apiBaseUrl}/api/loans/bulk-intake`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(upload.data)
        });
        
        if (response.ok) {
          await removePendingUpload(upload.id);
          console.log('[SW] Successfully synced upload:', upload.id);
          
          // Notify the client
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'UPLOAD_SYNCED',
                uploadId: upload.id,
                success: true
              });
            });
          });
        }
      } catch (error) {
        console.error('[SW] Failed to sync upload:', upload.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Sync calculation requests when back online
async function syncCalculationRequests() {
  try {
    console.log('[SW] Syncing calculation requests...');
    
    const pendingCalculations = await getPendingCalculations();
    
    for (const calculation of pendingCalculations) {
      try {
        // Get API base URL from the main thread or use relative path for same-origin
        const apiBaseUrl = self.location.origin.includes('vercel.app') 
          ? 'https://pcaf-server-production.up.railway.app' 
          : '';
        const response = await fetch(`${apiBaseUrl}/api/loans/batch-calculate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(calculation.data)
        });
        
        if (response.ok) {
          await removePendingCalculation(calculation.id);
          console.log('[SW] Successfully synced calculation:', calculation.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync calculation:', calculation.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Calculation sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'Your PCAF calculation is complete!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/financed-emissions/overview'
    },
    actions: [
      {
        action: 'view',
        title: 'View Results',
        icon: '/icons/view-action.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-action.png'
      }
    ]
  };

  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.data = { ...options.data, ...payload.data };
  }

  event.waitUntil(
    self.registration.showNotification('PCAF Emissions Engine', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/financed-emissions')
    );
  }
});

// IndexedDB helpers for offline storage
async function getPendingUploads() {
  // Implementation would use IndexedDB to store/retrieve pending uploads
  return [];
}

async function removePendingUpload(id) {
  // Implementation would remove upload from IndexedDB
  console.log('[SW] Removing pending upload:', id);
}

async function getPendingCalculations() {
  // Implementation would use IndexedDB to store/retrieve pending calculations
  return [];
}

async function removePendingCalculation(id) {
  // Implementation would remove calculation from IndexedDB
  console.log('[SW] Removing pending calculation:', id);
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_PORTFOLIO_DATA') {
    cachePortfolioData(event.data.data);
  }
});

// Cache portfolio data for offline access
async function cachePortfolioData(data) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put('/api/loans/portfolio', response);
    console.log('[SW] Portfolio data cached for offline access');
  } catch (error) {
    console.error('[SW] Failed to cache portfolio data:', error);
  }
}
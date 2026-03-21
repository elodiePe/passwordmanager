const CACHE_NAME = 'passwordmanager-v2'
const SW_BASE_PATH = self.location.pathname.replace(/sw\.js$/, '')
const withBase = (path) => `${SW_BASE_PATH}${String(path).replace(/^\//, '')}`
const urlsToCache = [
  withBase('/'),
  withBase('/index.html'),
  withBase('/manifest.json')
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        console.warn('Failed to cache some resources during install')
      })
    })
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip API calls and extension schemes
  if (url.pathname.includes('/api/') || url.protocol === 'chrome-extension:') {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline - cannot fetch data' }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      })
    )
    return
  }

  // Network-first for HTML navigation to avoid stale asset links
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(withBase('/index.html'), responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(withBase('/index.html'))
        })
    )
    return
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response
      }
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })
          return response
        })
        .catch(() => {
          // Return cached index.html as fallback for offline navigation
          return caches.match(withBase('/index.html'))
        })
    })
  )
})

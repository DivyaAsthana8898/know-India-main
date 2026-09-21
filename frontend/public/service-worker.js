/**
 * Know India - Service Worker
 * Enables offline functionality by caching static assets, images, and API responses.
 */

// Cache versioning - increment to invalidate all caches
const CACHE_VERSION = 4;
const CACHE_PREFIX = "know-india";

const CACHE_NAME = `${CACHE_PREFIX}-cache-v${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `${CACHE_PREFIX}-images-v${CACHE_VERSION}`;
const API_CACHE_NAME = `${CACHE_PREFIX}-api-v${CACHE_VERSION}`;
const CURRENT_CACHES = [CACHE_NAME, IMAGE_CACHE_NAME, API_CACHE_NAME];

// Static assets to cache on install (exclude / and index.html so deploys always get fresh HTML)
const STATIC_ASSETS = [
  "/offline.html",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png",
  "/favicon.ico"
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith(CACHE_PREFIX) && !CURRENT_CACHES.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Helper functions
function isImageRequest(request) {
  const url = new URL(request.url);
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico"];
  return imageExtensions.some((ext) => url.pathname.toLowerCase().endsWith(ext)) ||
    (request.headers.get("Accept") || "").includes("image/");
}

function isApiPlacesRequest(request) {
  return new URL(request.url).pathname.includes("/api/places");
}

function isNavigationRequest(request) {
  return request.mode === "navigate" || 
    (request.method === "GET" && request.headers.get("Accept")?.includes("text/html"));
}

// Fetch event - handle requests
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  // API requests - network first
  if (isApiPlacesRequest(request)) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cache.match(request).then((cached) => {
            return cached || new Response(
              JSON.stringify({ error: "Offline" }),
              { status: 503, headers: { "Content-Type": "application/json" } }
            );
          }));
      })
    );
    return;
  }

  // Images - cache first
  if (isImageRequest(request)) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => undefined);
        });
      })
    );
    return;
  }

  // HTML / navigation - network only, never cache (avoids white page after deploy)
  if (isNavigationRequest(request) || url.pathname === "/" || url.pathname === "/index.html") {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() => caches.match("/offline.html"))
    );
    return;
  }

  // Other requests (JS, CSS, etc.) - network first, then cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (isNavigationRequest(request)) {
            return caches.match("/offline.html");
          }
          return undefined;
        });
      })
  );
});

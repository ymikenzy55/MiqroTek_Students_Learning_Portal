const CACHE_NAME = "miqrotek-v3";
const STATIC_ASSETS = ["/manifest.json"];

/**
 * Only content-hashed or version-pinned assets may be served from cache.
 * HTML documents and RSC payloads are per-user and change with every deploy —
 * serving a stale one against fresh JS causes React hydration mismatches, and
 * caching an authenticated page leaks it to the next user of the device.
 */
function isCacheableAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json"
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  // Force the new SW to take over immediately, replacing the old one
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // Everything else (documents, RSC payloads, /api) goes straight to network.
  if (!isCacheableAsset(url)) return;

  // For static assets: use stale-while-revalidate so the user gets instant
  // loads from cache, but we also fetch the latest version in the background
  // and update the cache for next time. This ensures new deploys propagate
  // without the user having to hard-refresh.
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return response;
      }).catch(() => cached); // Fall back to cache if network fails

      // Return cached immediately if available, otherwise wait for network
      return cached || fetchPromise;
    })
  );
});

// Listen for messages from the page — allows the app to trigger an
// immediate update when a new version is detected.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

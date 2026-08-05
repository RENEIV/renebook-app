const CACHE_NAME = "renebook-v2-20260804";
const CORE_FILES = [
  "/",
  "/index.html",
  "/app-bible.html",
  "/app-biblia-random.html",
  "/proyecto.html",
  "/vision.html",
  "/manifest.json",
  "/assets/renebook-logo.png",
  "/css/biblia-random.css",
  "/js/biblia-random.js",
  "/data/daily-verses.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          return (await caches.match(request)) || (await caches.match("/index.html"));
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkRequest = fetch(request)
        .then((response) => {
          if (response.ok && new URL(request.url).origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkRequest;
    })
  );
});

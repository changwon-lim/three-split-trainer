const CACHE = "3split-v13-ios-fold7";
const ASSETS = ["./", "./index.html", "./styles.css", "./base-ui.css", "./ios-fold7-v13.css", "./app.js", "./history-v5.js", "./manifest.json", "./app-icon-v11-192.png", "./app-icon-v11-512.png", "./app-icon-maskable-v11-512.png"];
self.addEventListener("install", event => {event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))); self.skipWaiting();});
self.addEventListener("activate", event => {event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim();});
self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return;
  if(event.request.mode === "navigate" || /\.(?:css|js|json)$/.test(url.pathname)) {
    event.respondWith(fetch(event.request).then(response => {
      if(response.ok) {const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
      return response;
    }).catch(() => caches.match(event.request).then(hit => hit || caches.match("./index.html"))));
  } else {
    event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
      if(response.ok) {const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
      return response;
    })));
  }
});

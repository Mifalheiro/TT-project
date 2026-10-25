// Service worker mínimo: guarda só a "casca" da app. Os dados vêm sempre do Google (nunca ficam em cache aqui).
var CACHE = "navais-tt-v3";
var FICHEIROS = ["./", "./index.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(FICHEIROS); }));
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(caches.keys().then(function(nomes) {
    return Promise.all(nomes.filter(function(n) { return n !== CACHE; }).map(function(n) { return caches.delete(n); }));
  }));
  self.clients.claim();
});

self.addEventListener("fetch", function(e) {
  var url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;   // só ficheiros desta casca
  // Rede primeiro (apanha atualizações); se não houver rede, usa a cópia guardada
  e.respondWith(fetch(e.request).then(function(r) {
    var copia = r.clone(); caches.open(CACHE).then(function(c) { c.put(e.request, copia); }); return r;
  }).catch(function() { return caches.match(e.request); }));
});

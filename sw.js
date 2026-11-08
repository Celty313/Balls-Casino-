// balls-casino-v214: online first (so updates show up at once), saved copy when offline
var CACHE = 'balls-casino-v214';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return Promise.all(FILES.map(function (f) { return c.add(f).catch(function () {}); })); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request, u;
  if (r.method !== 'GET') return;
  try { u = new URL(r.url); } catch (x) { return; }
  if (u.origin !== self.location.origin) return;
  e.respondWith(new Promise(function (resolve) {
    var done = false;
    function fromCache() { return caches.match(r, { ignoreSearch: true }).then(function (m) { return m || caches.match('index.html') || caches.match('./'); }); }
    var timer = setTimeout(function () { if (done) return; fromCache().then(function (m) { if (m && !done) { done = true; resolve(m); } }); }, 4000);
    fetch(r, { cache: 'no-store' }).then(function (res) {
      if (done) { if (res && res.ok) { var c0 = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, c0); }); } return; }
      done = true; clearTimeout(timer);
      if (res && res.ok) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, cp); }); }
      resolve(res);
    }).catch(function () {
      clearTimeout(timer);
      if (done) return;
      fromCache().then(function (m) { done = true; resolve(m || new Response('Offline and not saved yet. Open the game once while online.', { status: 503 })); });
    });
  }));
});

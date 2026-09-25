/* Cache each release as one coherent app, including race-day preparation. */
const CACHE = 'lane50-shell-v28-classic-footer';
const FILES = ['./','index.html','plan.html','session.html','race.html','drills.html','progress.html','race-tools.html','preview.html','SWIMMING-PLAN.md','assets/styles.css','assets/preparation.css','assets/data.js','assets/navigation.js','assets/app.js','assets/offline.js'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil((async () => {
  const previous = (await caches.keys()).filter(key => key.startsWith('lane50-shell-') && key !== CACHE);
  for (const key of previous) await caches.delete(key);
  await self.clients.claim();
  // The preceding release has no update listener. Reload its open pages once
  // so an installed old plan cannot remain visible after this release activates.
  if (previous.length) {
    const clients = await self.clients.matchAll({type:'window'});
    // Navigation fetches wait for activation; do not await them inside it.
    for (const client of clients) client.navigate(client.url).catch(() => {});
  }
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request, {ignoreSearch: true})) || fetch(event.request)));
});

/* Cache each release as one coherent app, including race-day preparation. */
const CACHE = 'lane50-shell-v34-final-taper';
const FILES = ['./','index.html','tempo.html','assets/tempo-core.js','assets/tempo.js','assets/tempo-audio.js','assets/tempo.css','plan.html','session.html','race.html','drills.html','progress.html','race-tools.html','preview.html','SWIMMING-PLAN.md','manifest.webmanifest','assets/icon-192.png','assets/icon-512.png','assets/styles.css','assets/preparation.css','assets/pool.css','assets/pool.js','assets/data.js','assets/navigation.js','assets/storage.js','assets/settings.js','assets/app.js','assets/offline.js'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES))));
self.addEventListener('message', event => {
  if(event.data?.type === 'ACTIVATE_UPDATE')self.skipWaiting();
});
self.addEventListener('activate', event => event.waitUntil((async () => {
  const previous = (await caches.keys()).filter(key => key.startsWith('lane50-shell-') && key !== CACHE);
  for (const key of previous) await caches.delete(key);
  await self.clients.claim();
  // Existing sessions stay open; updates activate on request or after all tabs close.
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request, {ignoreSearch: true})) || fetch(event.request)));
});

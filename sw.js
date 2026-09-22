/* Bump the version when publishing a new app shell. */
const CACHE = 'lane50-shell-v21';
const FILES = ['./', 'index.html', 'plan.html', 'session.html', 'drills.html', 'assets/styles.css', 'assets/interactions.css', 'assets/data.js', 'assets/navigation.js', 'assets/app.js', 'assets/offline.js', 'assets/pickers.js'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES))));
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) if (key.startsWith('lane50-shell-') && key !== CACHE) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;
  // A coherent version stays cached for the whole visit, including session query URLs.
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request, {ignoreSearch: true})) || fetch(event.request)));
});

const CACHE_NAME = 'v1';
const urlsToCache = ['/api/keys', '/api/search-index', '/api/types', '/api/context-schema'];

function getUrl(request) {
  const url = new URL(request.url).pathname;
  return url.replace(/\/$/, '');
}

async function install() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(urlsToCache);
  self.skipWaiting();
}

async function loadFromCache(request) {
  const cache = await caches.open(CACHE_NAME);
  const init = Object.assign({}, request);
  delete init.url;
  request = new Request(request.url.replace(/\/$/, ''), init);

  const match = await cache.match(request);
  if (match) return match;

  console.log('not found in cache, fetching...', request.url);
  const response = await fetch(request.clone());
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function activate() {
  const cache = await caches.open(CACHE_NAME);
  const cachedKeys = await cache.keys();
  const urlsToCacheSet = new Set(urlsToCache);
  const keysToDelete = cachedKeys.filter(key => !urlsToCacheSet.has(getUrl(key)));
  await Promise.all(
    keysToDelete.map(key => (console.log('deleting from cache', key.url), cache.delete(key))),
  );
  self.clients.claim();
}

self.addEventListener('install', (event) => {
  event.waitUntil(install());
});

self.addEventListener('activate', (events) => {
  events.waitUntil(activate());
});

self.addEventListener('fetch', (event) => {
  if ('GET' === event.request.method) {
    const url = getUrl(event.request);

    if (urlsToCache.includes(url)) {
      console.log('loading from cache', url);
      event.respondWith(loadFromCache(event.request));
    }
  }
});

self.importScripts('/socket.io/socket.io.js');

const CACHE_NAME = 'v1';
const urlsToCache = [
  '/api/keys',
  '/api/search-index',
  '/api/types',
  '/api/context-schema',
  '/api/tags',
];

function getUrl(request) {
  const url = new URL(request.url).pathname;
  return url.replace(/\/$/, '');
}

async function install() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(urlsToCache);

  const socket = io(self.origin, { jsonp: false });
  socket.on('connect', () => console.log('connected to socket'));
  socket.on('refresh', () => {
    console.log('refreshing cache...');
    refresh().then(() => console.log('cache refreshed'));
  });

  self.skipWaiting();
}

async function refresh() {
  console.log('refreshing cache...');
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  await Promise.all(keys.map(key => cache.delete(key)));
  await cache.addAll(urlsToCache);
}

async function loadFromCache(originalRequest) {
  const cache = await caches.open(CACHE_NAME);

  const request = new Request(originalRequest.url.replace(/\/$/, ''));
  const match = await cache.match(request);
  if (match) return match;

  return await fetch(originalRequest);
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
    event.respondWith(loadFromCache(event.request));
  }
});

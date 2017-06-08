import idbKeyval from 'idb-keyval';
import { CACHE_NAME, notificationTypes, urls } from './constants';
import { testLogin, refresh, redirectToLogin } from './actions';
import getUrl from './getUrl';

self.importScripts('/socket.io/socket.io.js');

const replaceUrls = [
  {
    test: /^\/api\/keys\/?$/,
    get: idbKeyval.keys,
  },
  {
    test: /^\/api\/manifests\/(.+)/,
    get: match => idbKeyval.get(match[1]),
  },
];

async function install() {
  const socket = io(self.origin, { jsonp: false });
  socket.on('connect', () => console.log('connected to socket'));
  socket.on('refresh', () => {
    console.log('refreshing cache...');
    refresh().catch(error => console.error('error while refreshing cache', error));
  });

  try {
    await refresh();
  } catch (error) {
    console.error('error while loading cache', error);
  }

  self.skipWaiting();
}

async function activate() {
  const cache = await caches.open(CACHE_NAME);
  const cachedKeys = await cache.keys();
  const urlsToCacheSet = new Set(urls.CACHE);
  const keysToDelete = cachedKeys.filter(key => !urlsToCacheSet.has(getUrl(key)));
  await Promise.all(
    keysToDelete.map(key => (console.log('deleting from cache', key.url), cache.delete(key))),
  );
  self.clients.claim();
}

async function loadFromCache(originalRequest) {
  const url = getUrl(originalRequest);

  const replace = replaceUrls.find(x => x.test.test(url));
  if (replace) {
    const result = await replace.get(url.match(replace.test));
    return new Response(JSON.stringify(result), { status: result ? 200 : 404 });
  }

  const shouldCache = urls.CACHE.includes(url);
  const request = new Request(originalRequest.url.replace(/\/$/, ''));

  if (shouldCache) {
    const match = await caches.match(request);
    if (match) return match;
  }
  const response = await testLogin(originalRequest);
  if (shouldCache && response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

async function handleNotification(notification) {
  notification.close();
  switch (notification.tag) {
  case notificationTypes.LOGIN:
    await redirectToLogin();
    break;
  default:
    break;
  }
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

self.addEventListener('notificationclick', (event) => {
  event.waitUntil(handleNotification(event.notification));
});

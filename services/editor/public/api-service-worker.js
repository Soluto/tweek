self.importScripts('/socket.io/socket.io.js');

const CACHE_NAME = 'v1';
const urls = {
  IS_LOGGED_IN: '/api/logged-in',
  LOGIN: '/login',
  CACHE: ['/api/keys', '/api/search-index', '/api/types', '/api/schema', '/api/tags'],
};
const notificationTypes = {
  LOGIN: 'LOGIN',
};

let isLoggedIn = true;

function getUrl(request) {
  const url = new URL(request.url).pathname;
  return url.replace(/\/$/, '');
}

function showLoginExpiredMessage() {
  self.registration.showNotification('Login expired\nPlease log in again', {
    icon: '/tweek.png',
    requireInteraction: true,
    tag: notificationTypes.LOGIN,
  });
}

async function testLogin(request, shouldLoadCache = true) {
  const response = await fetch(request);

  const wasLoggedIn = isLoggedIn;
  isLoggedIn = response.status !== 403;

  if (!isLoggedIn) {
    if (Notification.permission === 'granted') {
      showLoginExpiredMessage();
    }
  } else {
    const loginNotifications = await self.registration.getNotifications({
      tag: notificationTypes.LOGIN,
    });
    loginNotifications.forEach(notification => notification.close());
    if (!wasLoggedIn && shouldLoadCache) {
      refresh();
    }
  }

  return response;
}

async function refresh() {
  console.log('refreshing cache...');

  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urls.CACHE);
  } catch (ex) {
    // need to check that ex is 403 error
    showLoginExpiredMessage();
  }

  console.log('cache refreshed');
}

async function redirectToLogin() {
  await self.clients.claim();
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => {
    if ('navigate' in client) {
      client.navigate(urls.LOGIN);
    }
  });
}

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
  const cache = await caches.open(CACHE_NAME);
  const url = getUrl(originalRequest);

  const shouldCache = urls.CACHE.includes(url);
  const request = new Request(originalRequest.url.replace(/\/$/, ''));

  if (shouldCache) {
    const match = await cache.match(request);
    if (match) return match;
  }
  const response = await testLogin(originalRequest);
  if (shouldCache && response.ok) {
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

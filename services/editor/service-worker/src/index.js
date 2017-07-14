import install from './install';
import activate from './activate';
import loadFromCache from './loadFromCache';
import handleNotification from './handleNotification';
import refresh from './refresh';

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

self.addEventListener('push', (event) => {
  if (event.data.text() === 'refresh') {
    refresh().catch(error => console.error('error while refreshing cache', error));
  }
});

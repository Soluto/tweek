import { notificationTypes } from './constants';
import { redirectToLogin } from './actions';
import install from './install';
import activate from './activate';
import loadFromCache from './loadFromCache';

self.importScripts('/socket.io/socket.io.js');

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

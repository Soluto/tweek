import idbKeyval from 'idb-keyval';
import { CACHE_NAME, notificationTypes, urls } from './constants';
let isLoggedIn = true;

export async function testLogin(request, shouldLoadCache = true) {
  const response = await fetch(request);

  const wasLoggedIn = isLoggedIn;
  isLoggedIn = response.status !== 403;

  if (!isLoggedIn) {
    if (Notification.permission === 'granted') {
      self.registration.showNotification('Login expired\nPlease log in again', {
        icon: '/tweek.png',
        requireInteraction: true,
        tag: notificationTypes.LOGIN,
      });
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

export async function refresh() {
  console.log('refreshing cache...');

  const testLoginResponse = await testLogin(urls.IS_LOGGED_IN, false);
  if (!testLoginResponse.ok) return;

  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(urls.CACHE);

  const localStorage = await fetch(urls.LOCAL_STORAGE);
  if (localStorage.ok) {
    const data = await localStorage.json();
    idbKeyval.clear();
    await Promise.all(data.map(manifest => idbKeyval.set(manifest.key_path, manifest)));
  }

  console.log('cache refreshed');
}

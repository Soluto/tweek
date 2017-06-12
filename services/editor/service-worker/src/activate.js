import { CACHE_NAME, urls } from './constants';
import activateSocket from './activateSocket';
import { refresh } from './data-actions';
import getUrl from './getUrl';

export default async function activate() {
  const cache = await caches.open(CACHE_NAME);
  const cachedKeys = await cache.keys();
  const urlsToCacheSet = new Set(urls.CACHE);
  const keysToDelete = cachedKeys.filter(key => !urlsToCacheSet.has(getUrl(key)));
  await Promise.all(
    keysToDelete.map(key => (console.log('deleting from cache', key.url), cache.delete(key))),
  );

  try {
    activateSocket();
    await refresh();
  } catch (error) {
    console.error('error while loading cache', error);
  }

  self.clients.claim();
}

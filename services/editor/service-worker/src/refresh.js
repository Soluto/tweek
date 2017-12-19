import idbKeyval from 'idb-keyval';
import { CACHE_NAME, urls } from './constants';
import { refreshIndex } from './search';
import notifyClients from './notifyClients';

let currentRevision;
let revisionInProgress;

async function clearCache() {
  console.log('clearing cache...');
  const cache = await caches.open(CACHE_NAME);
  const cachedKeys = await cache.keys();
  await Promise.all(cachedKeys.map(key => cache.delete(key)));

  console.log('cache cleared');
  await notifyClients({ type: 'cache-cleared' });
}

async function refreshManifests() {
  console.log('refreshing manifests...');
  const response = await fetch(urls.MANIFESTS, { credentials: 'include' });
  if (response.ok) {
    const manifests = await response.json();
    await idbKeyval.clear();
    await Promise.all(manifests.map(manifest => idbKeyval.set(manifest.key_path, manifest)));
    console.log('manifests refreshed');

    await notifyClients({ type: 'manifests' });
  } else {
    console.warn('unable to refresh manifests', response);
  }
}

export default async function refresh() {
  const response = await fetch(urls.REVISION, { credentials: 'include' });
  const revision = await response.text();
  if (revision === currentRevision || revision === revisionInProgress) return;

  console.log('refreshing cached items...');
  revisionInProgress = revision;

  try {
    await clearCache();

    await refreshManifests();

    await refreshIndex();

    currentRevision = revision;
    console.log('finished refreshing cache', revision);
  } catch (error) {
    console.warn('failed to refresh cache', error);
  } finally {
    revisionInProgress = null;
  }
}

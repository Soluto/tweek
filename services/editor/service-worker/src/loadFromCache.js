import idbKeyval from 'idb-keyval';
import { CACHE_NAME, urls } from './constants';
import { testLogin } from './actions';
import getUrl from './getUrl';

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

export default async function loadFromCache(originalRequest) {
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

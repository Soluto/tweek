import idbKeyval from 'idb-keyval';
import { CACHE_NAME, urls } from './constants';
import testLogin from './testLogin';
import { search, getSuggestions } from './search';
import getUrl from './getUrl';

const replaceUrls = [
  {
    test: /^\/api\/keys\/?$/,
    get: () => idbKeyval.keys(),
  },
  {
    test: /^\/api\/manifests\/?$/,
    get: () => idbKeyval.keys().then(keys => Promise.all(keys.map(key => idbKeyval.get(key)))),
  },
  {
    test: /^\/api\/manifests\/.+/,
    get: (req) => {
      const url = getUrl(req);
      const match = url.match(/^\/api\/manifests\/(.+)/);
      return idbKeyval.get(match[1]);
    },
  },
  {
    test: /^\/api\/search$/,
    get: (req) => {
      const url = new URL(req.url);
      return search(url.searchParams.get('q'), url.searchParams.get('count'));
    },
  },
  {
    test: /^\/api\/suggestions$/,
    get: (req) => {
      const url = new URL(req.url);
      return getSuggestions(url.searchParams.get('q'), url.searchParams.get('count'));
    },
  },
];

export default async function loadFromCache(originalRequest) {
  const url = getUrl(originalRequest);

  const replace = replaceUrls.find(x => x.test.test(url));
  if (replace) {
    const result = await replace.get(originalRequest);
    return new Response(JSON.stringify(result), {
      status: result ? 200 : 404,
      statusText: result ? 'OK' : 'Not Found',
    });
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

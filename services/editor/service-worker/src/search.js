import lunr from 'lunr';
import performSearch from '../../server/common/perform-search';
import { urls } from './constants';

async function getIndex() {
  const response = await fetch(urls.SEARCH_INDEX, { credentials: 'include' });
  const serializedIndex = await response.json();
  return lunr.Index.load(serializedIndex);
}

let searchIndexPromise = getIndex();

const createSearchFunction = field => (query, maxResults) =>
  searchIndexPromise.then(searchIndex =>
    performSearch(query, { maxResults, field, index: searchIndex }),
  );

export const getSuggestions = createSearchFunction('id');

export const search = createSearchFunction();

export async function refreshIndex() {
  searchIndexPromise = getIndex();
  await searchIndexPromise;
}

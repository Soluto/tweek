import lunr from 'lunr';
import performSearch from '../../server/common/perform-search';
import notifyClients from './notifyClients';
import { urls } from './constants';

async function getIndex() {
  const response = await fetch(urls.SEARCH_INDEX, { credentials: 'include' });
  const serializedIndex = await response.json();
  searchIndex = lunr.Index.load(serializedIndex);
  return searchIndex;
}

let searchIndexPromise = getIndex();
let searchIndex;

const createSearchFunction = field => async (query, maxResults) => {
  const currentSearchIndex = searchIndex || (await searchIndexPromise);
  return performSearch(query, { maxResults, field, index: currentSearchIndex });
};

export const getSuggestions = createSearchFunction('id');

export const search = createSearchFunction();

export async function refreshIndex() {
  console.log('refreshing search index...');
  searchIndexPromise = getIndex();
  await searchIndexPromise;

  console.log('search index refreshed');

  await notifyClients({ type: 'search-index' });
}

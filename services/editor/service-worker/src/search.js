import lunr from 'lunr';
import performSearch from '../../server/common/perform-search';
import { urls } from './constants';

let searchIndex;

const createSearchFunction = field => (query, maxResults) =>
  performSearch(query, { maxResults, field, index: searchIndex });

export const getSuggestions = createSearchFunction('id');

export const search = createSearchFunction();

export async function refreshIndex() {
  const response = await fetch(urls.SEARCH_INDEX, { credentials: 'include' });
  const serializedIndex = await response.json();
  searchIndex = lunr.Index.load(serializedIndex);
}

import lunr from 'lunr';
import performSearch from '../../common/search';
import { urls } from './constants';

let searchIndex;

const createSearchFunction = field => (query, maxResults) =>
  performSearch(query, { maxResults, field, index: searchIndex });

export const getSuggestions = createSearchFunction('id');

export const search = createSearchFunction();

export async function refreshIndex() {
  const response = await fetch(urls.SEARCH_INDEX, { credentials: 'same-origin' });
  const serializedIndex = await response.json();
  searchIndex = lunr.Index.load(serializedIndex);
}

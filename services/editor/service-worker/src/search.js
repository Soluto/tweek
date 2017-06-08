import R from 'ramda';
import lunr from 'lunr';
import { urls } from './constants';

let searchIndex;
const separator = /(?:[_/]|\s)/;
const byScore = R.descend(R.prop('score'));

const createSearchFunction = field =>
  function (query, maxResults) {
    if (!searchIndex || query === undefined || query.length === 0) return [];

    try {
      const searchResults = query
        .split(separator)
        .filter(s => s !== '')
        .map(s => `${s} *${s}~1 *${s}*`)
        .map(s => searchIndex.search(field ? `${field}:${s}` : s))
        .reduce((acc, results) => R.intersectionWith(R.eqBy(R.prop('ref')), acc, results));

      return R.pipe(R.sort(byScore), R.map(R.prop('ref')), R.slice(0, maxResults || 25))(
        searchResults,
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  };

export const getSuggestions = createSearchFunction('id');

export const search = createSearchFunction();

export async function refreshIndex() {
  const response = await fetch(urls.SEARCH_INDEX, { credentials: 'same-origin' });
  const serializedIndex = await response.json();
  searchIndex = lunr.Index.load(serializedIndex);
}

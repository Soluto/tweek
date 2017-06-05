/* global fetch */
import lunr from 'lunr';
import R from 'ramda';

const separator = /(?:[_/]|\s)/;
const byScore = R.descend(R.prop('score'));

let index;

export async function refreshIndex() {
  const response = await fetch('/api/search-index/', { credentials: 'same-origin' });
  const serializedIndex = await response.json();
  index = lunr.Index.load(serializedIndex);
}

const searchIndex = field =>
  function (query) {
    if (!index || query === undefined || query.length === 0) return [];

    try {
      const searchResults = query
        .split(separator)
        .filter(s => s !== '')
        .map(s => `${s} *${s}~1 *${s}*`)
        .map(s => index.search(field ? `${field}:${s}` : s))
        .reduce((acc, results) => R.intersectionWith(R.eqBy(R.prop('ref')), acc, results));

      return R.sort(byScore, searchResults).map(R.prop('ref'));
    } catch (error) {
      console.error(error);
      return [];
    }
  };

export const suggestions = searchIndex('id');

export const search = searchIndex();

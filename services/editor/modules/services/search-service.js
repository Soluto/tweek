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

const searchIndex = field => function (query) {
  if (!index || query === undefined || query.length === 0) return [];

  const separatedQuery = query.split(' ')
    .filter(x => x !== '')
    .map((word) => {
      if (separator.test(word)) {
        const fixedWord = word.split(separator).filter(x => x !== '').join('*');
        return `${fixedWord}~1 ${fixedWord}*`;
      }
      return `${word}~1 *${word}*`;
    })
    .join(' ');

  const searchResults = index.search(field ? `${field}:${separatedQuery}` : separatedQuery);
  return R.sort(byScore, searchResults).map(R.prop('ref'));
};

export const suggestions = searchIndex('id');

export const search = searchIndex();

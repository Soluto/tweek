/* global fetch */
import lunr from 'lunr';
import R from 'ramda';

const separator = /(?:[_/]|\s)/;
const byScore = R.descend(R.prop('score'));

let index;

export async function refreshIndex() {
  const response = await fetch('/api/search/', { credentials: 'same-origin' });
  const serializedIndex = await response.json();
  index = lunr.Index.load(serializedIndex);
}

export function suggestions(query) {
  if (!index || query === undefined || query.length === 0) return [];
  const separatedQuery = query.split(separator).join(' ');
  const searchResults = index.search(`id:${separatedQuery}*`);
  return R.sort(byScore, searchResults).map(R.prop('ref'));
}

import R from 'ramda';

export const separator = /(?:[_/]|\s|-)/;

const byScore = R.descend(R.prop('score'));

export default function (query = '', { maxResults = 25, field, index, getManifest }) {
  query = query.trim();
  if (!index || query === '') return Promise.resolve([]);

  try {
    const searchResults = query
      .split(separator)
      .filter(s => s !== '')
      .map(s => `${s} *${s}~1 *${s}*`)
      .map(s => index.search(field ? `${field}:${s}` : s))
      .reduce((acc, results) => R.intersectionWith(R.eqBy(R.prop('ref')), acc, results));

    return R.pipe(
      R.sort(byScore),
      R.slice(0, maxResults || 25),
      R.map(R.prop('ref')),
      R.map(key => getManifest(key)),
      x => Promise.all(x),
    )(searchResults);
  } catch (error) {
    console.error(`error searching for '${query}'`, error);
    return Promise.resolve([]);
  }
}

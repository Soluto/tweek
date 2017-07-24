import R from 'ramda';
import lunr from 'lunr';

export const separator = /(?:[_/]|\s|-)/;

const byScore = R.descend(R.prop('score'));

export default function (query = '', { maxResults = 25, field, index }) {
  query = query.trim();
  if (!index || query === '') return [];

  try {
    const searchResults = query
      .split(separator)
      .filter(s => s !== '')
      .map(s =>
        index.query((query) => {
          query.term(s, { field });
          query.term(s, {
            field,
            wildcard: lunr.Query.wildcard.LEADING | lunr.Query.wildcard.TRAILING,
          });
          query.term(s, {
            field,
            wildcard: lunr.Query.wildcard.LEADING,
            editDistance: 1,
          });
        }),
      )
      .reduce((acc, results) => R.intersectionWith(R.eqBy(R.prop('ref')), acc, results));

    return R.pipe(R.sort(byScore), R.map(R.prop('ref')), R.slice(0, maxResults || 25))(
      searchResults,
    );
  } catch (error) {
    console.error(`error searching for '${query}'`, error);
    return [];
  }
}

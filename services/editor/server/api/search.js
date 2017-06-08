import R from 'ramda';
import searchIndex, { separator } from '../searchIndex';

const byScore = R.descend(R.prop('score'));

export function getSearchIndex(req, res) {
  res.json(searchIndex.index);
}

const createSearchEndpoint = (field) => {
  function search(query, maxResults) {
    if (!searchIndex.index || query === undefined || query.length === 0) return [];

    try {
      const searchResults = query
        .split(separator)
        .filter(s => s !== '')
        .map(s => `${s} *${s}~1 *${s}*`)
        .map(s => searchIndex.index.search(field ? `${field}:${s}` : s))
        .reduce((acc, results) => R.intersectionWith(R.eqBy(R.prop('ref')), acc, results));

      return R.pipe(R.sort(byScore), R.map(R.prop('ref')), R.slice(0, maxResults || 25))(
        searchResults,
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  return function (req, res) {
    const result = search(req.query.q, req.query.count);
    res.json(result);
  };
};

export const getSuggestions = createSearchEndpoint('id');

export const search = createSearchEndpoint();

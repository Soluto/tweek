import R from 'ramda';
import searchIndex, { separator } from '../searchIndex';

const byScore = R.descend(R.prop('score'));

export function getSearchIndex(req, res) {
  res.json(searchIndex.index);
}

const createSearchEndpoint = (field) => {
  function search(query) {
    if (!searchIndex.index || query === undefined || query.length === 0) return [];

    try {
      const searchResults = query
        .split(separator)
        .filter(s => s !== '')
        .map(s => `${s} *${s}~1 *${s}*`)
        .map(s => searchIndex.index.search(field ? `${field}:${s}` : s))
        .reduce((acc, results) => R.intersectionWith(R.eqBy(R.prop('ref')), acc, results));

      return R.sort(byScore, searchResults).map(R.prop('ref'));
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  return function (req, res) {
    const result = search(req.query.q);
    res.json(result);
  };
};

export const getSuggestions = createSearchEndpoint('id');

export const search = createSearchEndpoint();

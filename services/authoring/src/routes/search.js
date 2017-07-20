const R = require('ramda');
const searchIndex = require('../search-index');

const separator = /(?:[_/]|\s|-)/;
const byScore = R.descend(R.prop('score'));

function performSearch(query = '', { maxResults = 25, field, index }) {
  query = query.trim();
  if (!index || query === '') return [];

  try {
    const searchResults = query
      .split(separator)
      .filter(s => s !== '')
      .map(s => `${s} *${s}~1 *${s}*`)
      .map(s => index.search(field ? `${field}:${s}` : s))
      .reduce((acc, results) => R.intersectionWith(R.eqBy(R.prop('ref')), acc, results));

    return R.pipe(R.sort(byScore), R.map(R.prop('ref')), R.slice(0, maxResults || 25))(
      searchResults,
    );
  } catch (error) {
    console.error(`error searching for '${query}'`, error);
    return [];
  }
}

const createSearchEndpoint = field => async (req, res) => {
  const index = searchIndex.index || (await searchIndex.indexPromise);
  const result = performSearch(req.query.q, {
    maxResults: req.query.count,
    field,
    index,
  });
  res.json(result);
};

module.exports = {
  async getSearchIndex(req, res) {
    res.json(await searchIndex.indexPromise);
  },
  getSuggestions: createSearchEndpoint('id'),
  search: createSearchEndpoint(),
};

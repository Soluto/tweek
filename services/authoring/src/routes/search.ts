import R = require('ramda');
import lunr = require('lunr');
import searchIndex from '../search-index';

const separator = /(?:[_/]|\s|-)/;

function addTerm(query, term, field) {
  query.term(term, { field });
  query.term(term, {
    field,
    wildcard: lunr.Query.wildcard.LEADING | lunr.Query.wildcard.TRAILING,
  });
  query.term(term, {
    field,
    wildcard: lunr.Query.wildcard.LEADING,
    editDistance: 1,
  });
}

function performSearch(searchString = '', { maxResults = 25, field, index }) {
  searchString = searchString.trim();
  if (!index || searchString === '') return [];

  try {
    const searchResults = index.query((query) => {
      searchString
        .split(separator)
        .filter(s => s !== '')
        .forEach(term => addTerm(query, term, field));
    });

    const trimResults = R.pipe(R.slice(0, maxResults || 25), R.map(R.prop('ref')));
    return trimResults(searchResults);
  } catch (error) {
    console.error(`error searching for '${searchString}'`, error);
    return [];
  }
}

const createSearchEndpoint = (field?: string) => async (req, res) => {
  const index = searchIndex.index || (await searchIndex.indexPromise);
  const result = performSearch(req.query.q, {
    maxResults: req.query.count,
    field,
    index,
  });
  res.json(result);
};

export default {
  async getSearchIndex(req, res) {
    res.json(await searchIndex.indexPromise);
  },
  getSuggestions: createSearchEndpoint('id'),
  search: createSearchEndpoint(),
};

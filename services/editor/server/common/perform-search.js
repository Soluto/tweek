import * as R from 'ramda';
import lunr from 'lunr';

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

export default function (searchString = '', { maxResults = 25, field, index }) {
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

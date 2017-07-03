import performSearch from '../common/perform-search';
import searchIndex from '../searchIndex';

export async function getSearchIndex(req, res) {
  res.json(await searchIndex.indexPromise);
}

const createSearchEndpoint = field => (req, res) => {
  const result = performSearch(req.query.q, {
    maxResults: req.query.count,
    field,
    index: searchIndex.index,
  });
  res.json(result);
};

export const getSuggestions = createSearchEndpoint('id');

export const search = createSearchEndpoint();

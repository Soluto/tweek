import performSearch from '../common/perform-search';
import searchIndex from '../searchIndex';

export async function getSearchIndex(req, res) {
  res.json(await searchIndex.index);
}

const createSearchEndpoint = field => async (req, res) => {
  const result = performSearch(req.query.q, {
    maxResults: req.query.count,
    field,
    index: await searchIndex.index,
  });
  res.json(result);
};

export const getSuggestions = createSearchEndpoint('id');

export const search = createSearchEndpoint();

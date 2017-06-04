import searchIndex from '../../server/searchIndex';

export function getSearchIndex(req, res) {
  res.json(searchIndex.index);
}

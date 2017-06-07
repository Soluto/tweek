import searchIndex from '../searchIndex';

export function getSearchIndex(req, res) {
  res.json(searchIndex.index);
}

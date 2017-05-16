import searchIndex from '../server/searchIndex';

export function getKeysIndex(req, res) {
  res.json(searchIndex.index);
}

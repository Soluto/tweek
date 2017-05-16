import keysIndex from '../server/keysIndex';

export function getKeysIndex(req, res) {
  res.json(keysIndex.index);
}

export function getSuggestions(req, res) {
  const suggestions = keysIndex.getSuggestions(req.query.query);
  res.json(suggestions);
}

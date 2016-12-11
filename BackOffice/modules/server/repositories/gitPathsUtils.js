export function getBasePathForKeys() {
  return `rules`;
}

export function getPathForJPad(keyName) {
  return `${getBasePathForKeys()}/${keyName}.jpad`;
}

export function getPathForMeta(keyName) {
  return `meta/${keyName}.json`;
}

export function getPathForTags() {
  return 'tags.json'
}

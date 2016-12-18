import path from 'path';

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

export function getKeyFromJPadPath(keyPath){
  const ext = path.extname(keyPath);
  return keyPath.substring(0, keyPath.length - ext.length);
}
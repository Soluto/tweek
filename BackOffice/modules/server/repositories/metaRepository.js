function getMockMeta(keyPath) {
  return {
    description: keyPath + ' description',
    displayName: 'some displayName',
    tags: ['pita', 'abc', '1132'],
  };
}

let metaStore = {
};

export function init(settings) {
  return {
    async getKeyMeta(keyPath) {
      var storedMeta = metaStore[keyPath];

      return storedMeta ? storedMeta : getMockMeta(keyPath);
    },
    updateKeyMeta(keyPath, newMeta) {
      metaStore[keyPath] = newMeta;
    },
  };
}

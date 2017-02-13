export let types = {
  string: {
    type: 'string'
  },
  number: {
    type: 'number'
  },
  bool: {
    type: 'boolean'
  }
};

let _initializationPromise;
export function getInitializationPromise() {
  return _initializationPromise || initializeTypes();
}

export function getTypeMeta(type) {
  return Object.keys(types)
    .map(x => types[x])
    .find(x => x.typeAlias === type || x.type === type);
}

export async function initializeTypes() {
  if (!!_initializationPromise) return;
  _initializationPromise = fetch(`/api/types`, { credentials: 'same-origin' })
    .then(data => data.json())
    .then(loadedTypes => {
      loadedTypes.forEach(x => {
        const typeAlias = x.typeAlias;
        types[typeAlias] = x;
      });
    });

  await _initializationPromise;
};

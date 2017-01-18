export let types = {
  string: {
    type: 'string'
  },
  number: {
    type: 'number'
  },
  bool: {
    type: 'bool'
  }
};

export const enumType = (baseType) => ({
  type: baseType,
  typeAlias: 'enum',
});

let initializationPromise;

export async function initializeTypes() {
  if (!!initializationPromise) return;
  initializationPromise = fetch(`/api/types`, { credentials: 'same-origin' })
    .then(data => data.json())
    .then(loadedTypes => {
      loadedTypes.forEach(x => {
        const typeAlias = x.typeAlias;
        types[typeAlias] = x;
      });
    });

  await initializationPromise;
};

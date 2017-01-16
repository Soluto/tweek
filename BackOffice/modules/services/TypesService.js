export const types = {
  Enum(baseType) {
    return {
      type: baseType,
      typeAlias: 'enum',
    }
  }
};

export async function initializeTypes() {
  await fetch(`/api/types`, { credentials: 'same-origin' })
    .then(data => data.json())
    .then(loadedTypes => {
      loadedTypes.forEach(x => {
        const typeAlias = x.typeAlias;
        types[typeAlias] = x;
      });
    });
};

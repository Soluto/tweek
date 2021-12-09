const getStorage = (): Pick<Storage, 'setItem' | 'getItem' | 'removeItem'> => {
  if (typeof localStorage === 'undefined') {
    const store: Record<string, string> = {};
    return {
      setItem: (itemKey, itemValue) => {
        store[itemKey] = itemValue;
      },
      getItem: (itemKey) => store[itemKey],
      removeItem: (itemKey) => delete store[itemKey],
    };
  } else {
    return localStorage;
  }
};

export default getStorage();

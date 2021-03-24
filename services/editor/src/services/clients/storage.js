const getStorage = () => {
  if (typeof localStorage === 'undefined') {
    const store = {};
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

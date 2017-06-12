/* global fetch */

const createSearchFunction = endpoint =>
  async function suggestions(query) {
    if (!query || query === '') return [];
    const response = await fetch(`/api/${endpoint}?q=${encodeURIComponent(query)}`, {
      credentials: 'same-origin',
    });
    const results = await response.json();
    return results.map(x => x.key_path);
  };

export const getSuggestions = createSearchFunction('suggestions');

export const search = createSearchFunction('search');

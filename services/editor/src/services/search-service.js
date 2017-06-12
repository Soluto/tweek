/* global fetch */

const createSearchFunction = endpoint =>
  async function suggestions(query) {
    if (!query || query === '') return [];
    const response = await fetch(`/api/${endpoint}?q=${encodeURIComponent(query)}`, {
      credentials: 'same-origin',
    });
    return await response.json();
  };

export const getSuggestions = createSearchFunction('suggestions');

export const search = createSearchFunction('search');

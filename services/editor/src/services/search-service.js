/* global fetch */

let maxResults;

const createSearchFunction = endpoint =>
  async function suggestions(query) {
    if (!query || query === '') return [];

    if (!maxResults) {
      const response = await fetch('/api/editor-configuration/search/max_results');
      maxResults = (await response.json()) || 25;
    }

    const response = await fetch(
      `/api/${endpoint}?q=${encodeURIComponent(query)}&count=${maxResults}`,
      {
        credentials: 'same-origin',
      },
    );
    return await response.json();
  };

export const getSuggestions = createSearchFunction('suggestions');

export const search = createSearchFunction('search');

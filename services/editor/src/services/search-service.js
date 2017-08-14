/* global fetch */

import fetch from '../utils/fetch';
let maxResults;

const createSearchFunction = endpoint =>
  async function suggestions(query) {
    if (!query || query === '') return [];

    if (!maxResults) {
      try {
        const response = await fetch('/api/editor-configuration/search/max_results');
        maxResults = (await response.json()) || 25;
      } catch (err) {
        console.error("unable to get 'search/max_results' configuration", err);
      }
    }

    const response = await fetch(
      `/api/${endpoint}?q=${encodeURIComponent(query)}&count=${maxResults || 25}`,
      {
        credentials: 'same-origin',
      },
    );
    return await response.json();
  };

export const getSuggestions = createSearchFunction('suggestions');

export const search = createSearchFunction('search');

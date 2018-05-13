/* global fetch process console */

import fetch from '../utils/fetch';
let maxResults;
let showInternalKeys;

export const filterInternalKeys = async list =>
  list && !await shouldShowInternalKeys() ? list.filter(x => !/^@tweek\//.test(x)) : list;

const shouldShowInternalKeys = async () => {
  if (showInternalKeys === undefined) {
    try {
      const response = await fetch(`/values/@tweek/editor/show_internal_keys`);
      showInternalKeys = await response.json();
    } catch (err) {
      console.error("unable to get 'show_internal_keys' configuration", err);
    }
  }
  return showInternalKeys;
};

const createSearchFunction = endpoint =>
  async function suggestions(query) {
    if (!query || query === '') return [];

    if (!maxResults) {
      try {
        const response = await fetch(`/values/@tweek/editor/search/max_results`);
        maxResults = (await response.json()) || 25;
      } catch (err) {
        console.error("unable to get 'search/max_results' configuration", err);
      }
    }

    const response = await fetch(
      `/${endpoint}?q=${encodeURIComponent(query)}&count=${maxResults || 25}`,
    );
    return await response.json();
  };

const suggestionFn = createSearchFunction('suggestions');

export const getSuggestions = async query => filterInternalKeys(await suggestionFn(query));

export const search = createSearchFunction('search');

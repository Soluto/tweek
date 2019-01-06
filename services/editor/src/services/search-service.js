/* global fetch process console */
import * as R from 'ramda';
import fetch, { getConfiguration } from '../utils/fetch';
let maxResults;
let showInternalKeys;

export const filterInternalKeys = async list =>
  list && !await shouldShowInternalKeys()
    ? R.filter(x => !/^@tweek\//.test(x.key_path), list)
    : list;

const shouldShowInternalKeys = async () => {
  if (showInternalKeys === undefined) {
    try {
      const response = await getConfiguration(`show_internal_keys`);
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
        const response = await getConfiguration(`search/max_results`);
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

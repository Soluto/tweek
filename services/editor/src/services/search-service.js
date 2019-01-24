/* global fetch process console */
import * as R from 'ramda';
import { getConfiguration } from '../utils/fetch';
import { tweekManagementClient } from '../utils/tweekClients';
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

const getMaxResults = async () => {
  if (!maxResults) {
    try {
      const response = await getConfiguration(`search/max_results`);
      maxResults = (await response.json()) || 25;
    } catch (err) {
      console.error("unable to get 'search/max_results' configuration", err);
    }
  }

  return maxResults || 25;
};

export const getSuggestions = async (query) => {
  const maxResults = await getMaxResults();
  const suggestions = await tweekManagementClient.getSuggestions(query, maxResults);
  return await filterInternalKeys(suggestions);
};

export const search = async (query) => {
  const maxResults = await getMaxResults();
  return await tweekManagementClient.search(query, maxResults);
};

import * as R from 'ramda';
import { tweekManagementClient } from '../utils/tweekClients';

export const filterInternalKeys = (list, showInternalKeys) =>
  list && !showInternalKeys ? R.filter((x) => !/^@tweek\//.test(x.key_path), list) : list;

export const getSuggestions = async (query, { maxSearchResults, showInternalKeys }) => {
  const suggestions = await tweekManagementClient.getSuggestions(query, maxSearchResults || 25);
  return filterInternalKeys(suggestions, showInternalKeys);
};

export const search = async (query, maxResults) =>
  await tweekManagementClient.search(query, maxResults || 25);

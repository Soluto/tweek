import * as R from 'ramda';
import { tweekManagementClient, tweekRepository } from '../utils/tweekClients';

export const filterInternalKeys = async list =>
  list && !await shouldShowInternalKeys()
    ? R.filter(x => !/^@tweek\//.test(x.key_path), list)
    : list;

const shouldShowInternalKeys = async () => {
  const show = await tweekRepository.get('@tweek/editor/show_internal_keys');
  return show.value;
};

const getMaxResults = async () => {
  const maxResults = await tweekRepository.get('@tweek/editor/search/max_results');
  return maxResults.value || 25;
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

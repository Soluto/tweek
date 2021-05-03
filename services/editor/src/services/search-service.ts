import { filter } from 'ramda';
import { KeyManifest } from 'tweek-client';
import { tweekManagementClient } from '../utils';

const internalKey = /^@tweek\//;

export const filterInternalKeys = <
  T extends Record<string, KeyManifest> | Array<string | KeyManifest>
>(
  list: T,
  showInternalKeys: boolean,
): T =>
  list && !showInternalKeys
    ? (filter(
        (x: string | KeyManifest) => !internalKey.test(typeof x === 'string' ? x : x.key_path),
        list as any,
      ) as T)
    : list;

export type SuggestionConfig = {
  maxSearchResults?: number;
  showInternalKeys?: boolean;
};

export const getSuggestions = async (
  query: string,
  { maxSearchResults, showInternalKeys = false }: SuggestionConfig,
) => {
  const suggestions = await tweekManagementClient.getSuggestions(query, maxSearchResults || 25);
  return filterInternalKeys(suggestions, showInternalKeys);
};

export const search = async (query: string, maxResults: number) =>
  await tweekManagementClient.search(query, maxResults || 25);

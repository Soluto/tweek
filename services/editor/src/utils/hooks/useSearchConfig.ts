import { useTweekValue } from 'react-tweek';

export const useMaxSearchResults = useTweekValue.create('@tweek/editor/search/max_results', 25);
export const useShowInternalKeys = useTweekValue.create('@tweek/editor/show_internal_keys', false);
export const useHistorySince = useTweekValue.create('@tweek/editor/history/since', '1 month ago');
export const useEnableCardsView = useTweekValue.create(
  '@tweek/editor/experimental/keys_search/enable_cards_view',
  false,
);

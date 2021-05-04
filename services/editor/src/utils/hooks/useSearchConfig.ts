import { useTweekValue } from 'react-tweek';

export const useMaxSearchResults = useTweekValue.create('@tweek/editor/search/max_results', 25);
export const useShowInternalKeys = useTweekValue.create('@tweek/editor/show_internal_keys', false);

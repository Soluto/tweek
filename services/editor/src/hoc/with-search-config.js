import { useTweekValue, withTweekValues } from 'react-tweek';

export default withTweekValues(
  {
    maxSearchResults: '@tweek/editor/search/max_results',
    showInternalKeys: '@tweek/editor/show_internal_keys',
  },
  {
    defaultValues: {},
  },
);

export const useMaxSearchResults = useTweekValue.create('@tweek/editor/search/max_results', 25);
export const useShowInternalKeys = useTweekValue.create('@tweek/editor/show_internal_keys', false);

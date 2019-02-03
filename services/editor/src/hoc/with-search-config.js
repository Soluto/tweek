import { withTweekKeys } from '../contexts/Tweek';

export default withTweekKeys(
  {
    maxSearchResults: '@tweek/editor/search/max_results',
    showInternalKeys: '@tweek/editor/show_internal_keys',
  },
  {
    defaultValues: { maxSearchResults: null, showInternalKeys: null },
  },
);

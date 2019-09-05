import { withTweekValues } from 'react-tweek';

export default withTweekValues(
  {
    maxSearchResults: '@tweek/editor/search/max_results',
    showInternalKeys: '@tweek/editor/show_internal_keys',
  },
  {
    defaultValues: {},
  },
);

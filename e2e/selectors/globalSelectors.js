import { getRelativeSelector, getSelectorByClassNames, _getSelectorByIndex } from './selectorUtils';

const globalSelectors = {};

globalSelectors.BACKGROUND = getSelectorByClassNames('header');
globalSelectors.ALERT_BACKGROUND = '.rodal-mask';

globalSelectors.typeaheadSuggestionByIndex = (suggestionIndex) => {
  const selector =
    getRelativeSelector([
      getSelectorByClassNames('bootstrap-typeahead-menu'),
      _getSelectorByIndex('li', suggestionIndex),
    ]);

  return selector;
};

export default globalSelectors;

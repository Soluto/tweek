import { getRelativeSelector, getSelectorByClassNames, _getSelectorByIndex } from './selectorUtils';

const globalSelectors = {};

globalSelectors.BACKGROUND = getSelectorByClassNames('header');
globalSelectors.ALERT_BACKGROUND = '.rodal-mask';
globalSelectors.ERROR_NOTIFICATION_TITLE = '.notifications-br .notification-error .notification-title';

globalSelectors.typeaheadSuggestionByIndex = (suggestionIndex) => {
  const selector =
    getRelativeSelector([
      getSelectorByClassNames('bootstrap-typeahead-menu'),
      _getSelectorByIndex('li', suggestionIndex),
    ]);

  return selector;
};

export default globalSelectors;

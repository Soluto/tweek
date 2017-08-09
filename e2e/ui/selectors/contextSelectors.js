import { getRelativeSelector, getSelectorByClassNames } from './selectorUtils';

const contextSelectors = {};
contextSelectors.CONTEXT_TYPE_INPUT = getSelectorByClassNames('context-search-container', 'identity-type-container', 'bootstrap-typeahead-input', 'input-main');
contextSelectors.CONTEXT_ID_INPUT = getRelativeSelector([getSelectorByClassNames('context-search-container', 'identity-id-container'), 'input']);
contextSelectors.OPEN_CONTEXT_BUTTON = getSelectorByClassNames('context-search-container', 'search-button');

contextSelectors.CURRENT_CONTEXT_TYPE = getSelectorByClassNames('identity-title', 'identity-type');
contextSelectors.CURRENT_CONTEXT_ID = getSelectorByClassNames('identity-title', 'identity-id');

contextSelectors.ADD_KEY_BUTTON = getSelectorByClassNames('fixed-keys-container', 'add-key-button');
contextSelectors.SAVE_CHANGES_BUTTON = getSelectorByClassNames('fixed-keys-container', 'save-button');

contextSelectors.keyContainer = (keyName = '') => {
  const keyContainerSelector = getSelectorByClassNames('fixed-key-container');
  return `${keyContainerSelector}[data-fixed-key= "${keyName}"]`;
};

contextSelectors.keyDeleteButton = (keyName) => {
  return getRelativeSelector([
    contextSelectors.keyContainer(keyName),
    getSelectorByClassNames('delete-button'),
  ]);
};

contextSelectors.keyNameInput = (keyName) => {
  return getRelativeSelector([
    contextSelectors.keyContainer(keyName),
    getSelectorByClassNames('key-input', 'bootstrap-typeahead-input', 'input-main'),
  ]);
};

contextSelectors.keyValueInput = (keyName) => {
  return getRelativeSelector([
    contextSelectors.keyContainer(keyName),
    getSelectorByClassNames('value-input'),
  ]);
};

export default contextSelectors;

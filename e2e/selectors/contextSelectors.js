import { getRelativeSelector, getSelectorByClassNames, _getSelectorByIndex, _getSelectorWithAttribute } from './selectorUtils';

const contextSelectors = {};
contextSelectors.CONTEXT_TYPE_INPUT = getSelectorByClassNames('context-search-container', 'context-type-container', 'bootstrap-typeahead-input-main');
contextSelectors.CONTEXT_ID_INPUT = getRelativeSelector([getSelectorByClassNames('context-search-container', 'context-id-container'), 'input']);
contextSelectors.OPEN_CONTEXT_BUTTON = getSelectorByClassNames('context-search-container', 'search-button');

contextSelectors.CURRENT_CONTEXT_TYPE = getSelectorByClassNames('context-title', 'context-type');
contextSelectors.CURRENT_CONTEXT_ID = getSelectorByClassNames('context-title', 'context-id');

contextSelectors.ADD_KEY_BUTTON = getSelectorByClassNames('fixed-keys-container', 'add-key-button');
contextSelectors.SAVE_CHANGES_BUTTON = getSelectorByClassNames('fixed-keys-container', 'save-button');

contextSelectors.keyContainer = (keyName = '') => {
  const keyContainerSelector = getSelectorByClassNames('fixed-key-container');
  return `${keyContainerSelector}[data-fixed-key= "${keyName}"]`;
};

contextSelectors.keyContainerByIndex = (index) => {
  const keyContainerSelector = getSelectorByClassNames('fixed-key-container');
  return index ? _getSelectorByIndex(keyContainerSelector, index) : keyContainerSelector;
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
    getSelectorByClassNames('key-input'),
  ]);
};


contextSelectors.keyNameInputByIndex = (index) => {
  return getRelativeSelector([
    contextSelectors.keyContainerByIndex(index),
    getSelectorByClassNames('key-input'),
  ]);
};

contextSelectors.keyValueInput = (keyName) => {
  return getRelativeSelector([
    contextSelectors.keyContainer(keyName),
    getSelectorByClassNames('value-input'),
  ]);
};

contextSelectors.keyValueInputByIndex = (index) => {
  return getRelativeSelector([
    contextSelectors.keyContainerByIndex(index),
    getSelectorByClassNames('value-input'),
  ]);
};

export default contextSelectors;

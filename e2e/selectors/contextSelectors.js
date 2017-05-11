import { getRelativeSelector, getSelectorByClassNames, _getSelectorByIndex, _getSelectorWithAttribute } from './selectorUtils';

const contextSelectors = {};
contextSelectors.CONTEXT_TYPE_INPUT = getSelectorByClassNames('context-search-container', 'context-type-container', 'bootstrap-typeahead-input-main');
contextSelectors.CONTEXT_ID_INPUT = getRelativeSelector([getSelectorByClassNames('context-search-container', 'context-id-container'), 'input']);
contextSelectors.OPEN_CONTEXT_BUTTON = getSelectorByClassNames('context-search-container', 'search-button');

contextSelectors.CURRENT_CONTEXT_TYPE = getSelectorByClassNames('context-title', 'context-type');
contextSelectors.CURRENT_CONTEXT_ID = getSelectorByClassNames('context-title', 'context-id');

contextSelectors.ADD_KEY_BUTTON = getSelectorByClassNames('fixed-keys-container', 'add-key-button');
contextSelectors.SAVE_CHANGES_BUTTON = getSelectorByClassNames('fixed-keys-container', 'save-button');

contextSelectors.keyContainer = (index) => {
  const keyContainerSelector = getSelectorByClassNames('fixed-key-container');
  return index ? _getSelectorByIndex(keyContainerSelector, index) : keyContainerSelector;

};

contextSelectors.keyDeleteButton = (index) => {
  return getRelativeSelector([
    contextSelectors.keyContainer(index),
    getSelectorByClassNames('delete-button'),
  ]);
};

contextSelectors.keyNameInput = (index) => {
  return getRelativeSelector([
    contextSelectors.keyContainer(index),
    getSelectorByClassNames('key-input'),
  ]);
};

contextSelectors.keyValueInput = (index) => {
  return getRelativeSelector([
    contextSelectors.keyContainer(index),
    getSelectorByClassNames('value-input'),
  ]);
};

export default contextSelectors;

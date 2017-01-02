const selectors = {};

function getRelativeSelector(selectorsHierarchy) {
  return selectorsHierarchy.join(' ');
}

function getSelectorByClassNames() {
  let classes = Object.keys(arguments).map(x => arguments[x]);
  classes = classes.map(x => `[class*= ${x}]`);
  return getRelativeSelector(classes);
}

function _getSelectorByIndex(selector, index) {
  return index ? selector + `:nth-of-type(${index})` : selector;
}

function _getSelectorWithAttribute(selector, attribute, value) {
  return selector + `[${attribute}*="${value}"]`;
}

selectors.BACKGROUND = getSelectorByClassNames('header');
selectors.SAVE_CHANGES_BUTTON = getSelectorByClassNames('key-action-buttons-wrapper', 'save-changes-button');
selectors.ADD_KEY_BUTTON = getSelectorByClassNames('keys-page-container', 'add-button');
selectors.KEY_NAME_INPUT = getSelectorByClassNames('display-name-wrapper', 'bootstrap-typeahead-input-main');
selectors.EDITABLE_KEY_NAME = getSelectorByClassNames('display-name-text');
selectors.VALIDATION_MESSAGE = getSelectorByClassNames('validation-message');
selectors.KEY_PATH_SUGGESTIONS = getSelectorByClassNames('dropdown-menu');
selectors.KEY_ACTUAL_PATH = getSelectorByClassNames('actual-path');
selectors.KEY_FOLDER_NAME = getSelectorByClassNames('key-folder-name');
selectors.KEY_LINK = getSelectorByClassNames('key-link');
selectors.DEFAULT_VALUE_RULE = getSelectorByClassNames('conditions-container', 'default-value');
selectors.DEFAULT_VALUE_INPUT = getRelativeSelector([selectors.DEFAULT_VALUE_RULE, getSelectorByClassNames('values-input')]);
selectors.DELETE_KEY_BUTTON = getSelectorByClassNames('delete-key-button');
selectors.ADD_RULE_BUTTON = getSelectorByClassNames('add-rule-button');
selectors.ADD_CONDITION_BUTTON = getSelectorByClassNames('add-condition-button');
selectors.RULE_CONDITION = getSelectorByClassNames('condition-wrapper');
selectors.TAB_ITEM_HEADER = getSelectorByClassNames('tab-header');
selectors.RULES_TAB_ITEM = _getSelectorByIndex(selectors.TAB_ITEM_HEADER, 1);
selectors.SOURCE_TAB_ITEM = _getSelectorByIndex(selectors.TAB_ITEM_HEADER, 2);
selectors.KEY_SOURCE_TEXT = getSelectorByClassNames('key-def-json');
selectors.KEY_VIEWER_CONTAINER = getSelectorByClassNames('key-viewer-container');
selectors.KEY_PAGE = getSelectorByClassNames('key-page');
selectors.TAGS_INPUT = getRelativeSelector([getSelectorByClassNames('tag-input'), 'input']);
selectors.TAG = getSelectorByClassNames('tags-container', 'selected', 'tag');
selectors.TAGS_SUGGESTION = getRelativeSelector([getSelectorByClassNames('tags-suggestion'), 'ul', 'li']);
selectors.KEY_LIST_FILTER = getSelectorByClassNames('search-input');

selectors.folder = (folderName) => {
  return _getSelectorWithAttribute(selectors.KEY_FOLDER_NAME, 'data-folder-name', folderName);
};

selectors.keyLink = (keyName) => {
  return _getSelectorWithAttribute(selectors.KEY_LINK, 'href', `/keys/${keyName}`);
};

selectors.ruleContainer = (ruleIndex) => {
  const ruleContainerSelector = getSelectorByClassNames('conditions-container');
  return ruleIndex ? _getSelectorByIndex(ruleContainerSelector, ruleIndex) : ruleContainerSelector;
};

selectors.conditionValue = (conditionIndex) => {
  const selector = getRelativeSelector([
    _getSelectorByIndex(selectors.RULE_CONDITION, conditionIndex),
    getSelectorByClassNames('property-value-wrapper'),
    getSelectorByClassNames('value-input'),
  ]);

  return selector;
};

selectors.conditionPropertyName = (conditionIndex) => {
  const selector =
    getRelativeSelector([
      _getSelectorByIndex(selectors.RULE_CONDITION, conditionIndex),
      getSelectorByClassNames('property-name-wrapper'),
      getSelectorByClassNames('bootstrap-typeahead-input-main'),
    ]);

  return selector;
};

selectors.conditionPropertyNameSuggestion = (suggestionIndex) => {
  const selector =
    getRelativeSelector([
      getSelectorByClassNames('bootstrap-typeahead-menu'),
      _getSelectorByIndex('li', suggestionIndex),
      getSelectorByClassNames('property-suggestion-wrapper'),
    ]);

  return selector;
};

export { selectors, getRelativeSelector };

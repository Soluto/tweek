import { getRelativeSelector, getSelectorByClassNames, _getSelectorByIndex, _getSelectorWithAttribute } from './selectorUtils';

const keySelectors = {};

keySelectors.DEPENDS_ON = '[data-comp=depends-on]';
keySelectors.DEPENDS_ON_TOGGLE = '[data-comp=depends-on-toggle]';
keySelectors.USED_BY = '[data-comp=used-by]';
keySelectors.USED_BY_TOGGLE = '[data-comp=used-by-toggle]';
keySelectors.SAVE_CHANGES_BUTTON = '[data-comp=save-changes-button]';
keySelectors.ADD_KEY_BUTTON = getSelectorByClassNames('keys-page-container', 'add-key-button');
keySelectors.KEY_NAME_INPUT = getSelectorByClassNames('key-main-input', 'auto-suggest', 'bootstrap-typeahead-input', 'input-main');
keySelectors.KEY_DISPLAY_NAME = getSelectorByClassNames('display-name-text');
keySelectors.KEY_NAME_VALIDATION_ALERT_ICON = getSelectorByClassNames('auto-suggest-wrapper', 'validation-icon-wrapper');
keySelectors.KEY_VALUE_TYPE_VALIDATION_ALERT_ICON = getSelectorByClassNames('auto-suggest-wrapper', 'validation-icon-wrapper');
keySelectors.KEY_PATH_SUGGESTIONS = getSelectorByClassNames('dropdown-menu');
keySelectors.KEY_ACTUAL_PATH = getSelectorByClassNames('actual-path');
keySelectors.KEY_FOLDER_NAME = getSelectorByClassNames('key-folder-name');
keySelectors.KEY_LINK = getSelectorByClassNames('key-link');
keySelectors.DEFAULT_VALUE_INPUT = getRelativeSelector([getSelectorByClassNames('default-value-container'), 'input']);
keySelectors.ARCHIVE_KEY_BUTTON = '#archive-key-button';
keySelectors.UNARCHIVE_KEY_BUTTON = '#unarchive-key-button';
keySelectors.DELETE_KEY_BUTTON = '#delete-key-button';
keySelectors.ADD_RULE_BUTTON = getSelectorByClassNames('add-rule-button');
keySelectors.ADD_CONDITION_BUTTON = getSelectorByClassNames('add-condition-button');
keySelectors.RULE_CONDITION = getSelectorByClassNames('condition-wrapper');
keySelectors.TAB_ITEM_HEADER = getSelectorByClassNames('tab-header');
keySelectors.RULES_TAB_ITEM = _getSelectorByIndex(keySelectors.TAB_ITEM_HEADER, 1);
keySelectors.SOURCE_TAB_ITEM = _getSelectorByIndex(keySelectors.TAB_ITEM_HEADER, 2);
keySelectors.KEY_VIEWER_CONTAINER = getSelectorByClassNames('key-viewer-container');
keySelectors.KEY_PAGE = getSelectorByClassNames('key-page');
keySelectors.TAGS_INPUT = getRelativeSelector([getSelectorByClassNames('key-description-and-tags-wrapper', 'tag-input'), 'input']);
keySelectors.TAG = getSelectorByClassNames('tags-container', 'selected', 'tag');
keySelectors.TAGS_SUGGESTION = getRelativeSelector([getSelectorByClassNames('tags-suggestion'), 'ul', 'li']);
keySelectors.KEY_LIST_FILTER = getRelativeSelector([getSelectorByClassNames('search-input-wrapper'), getSelectorByClassNames('search-input')]);
keySelectors.READONLY_KEY_MESSAGE = getSelectorByClassNames('readonly-key-message');
keySelectors.KEY_VALUE_TYPE_INPUT = getSelectorByClassNames('key-value-type-selector-wrapper', 'bootstrap-typeahead-input', 'input-main');
keySelectors.NONE_EXISTING_KEY = getSelectorByClassNames('key-page-message');
keySelectors.ALERT_OK_BUTTON = getSelectorByClassNames('rodal-confirm-btn');
keySelectors.ALERT_CANCEL_BUTTON = getSelectorByClassNames('rodal-cancel-btn');
keySelectors.ADD_PARTITION_INPUT = getRelativeSelector([getSelectorByClassNames('partitions-selector-container'), 'input']);
keySelectors.AUTO_PARTITION_BUTTON = getSelectorByClassNames('auto-partition-btn');
keySelectors.RESET_PARTITIONS_BUTTON = getSelectorByClassNames('reset-partitions-btn');
keySelectors.ADD_PARTITION_GROUP_BUTTON = getSelectorByClassNames('new-partition-container', 'add-partition-button');

keySelectors.folder = (folderName) => {
  return _getSelectorWithAttribute(keySelectors.KEY_FOLDER_NAME, 'data-folder-name', folderName);
};

keySelectors.keyLink = (keyName) => {
  return _getSelectorWithAttribute(keySelectors.KEY_LINK, 'href', `/keys/${keyName}`);
};

keySelectors.ruleContainer = (ruleIndex) => {
  const ruleContainerSelector = getSelectorByClassNames('conditions-container');
  return ruleIndex ? _getSelectorByIndex(ruleContainerSelector, ruleIndex) : ruleContainerSelector;
};

keySelectors.conditionValue = (ruleNumber, conditionNumber) => {
  const conditionValueSelector = getRelativeSelector([
    _getSelectorByIndex(keySelectors.RULE_CONDITION, conditionNumber),
    getSelectorByClassNames('property-value-wrapper'),
    'input',
  ]);

  return getRelativeSelector([keySelectors.ruleContainer(ruleNumber), conditionValueSelector]);
};

keySelectors.conditionPropertyName = (ruleNumber, conditionNumber) => {
  const propertyNameSelector =
    getRelativeSelector([
      _getSelectorByIndex(keySelectors.RULE_CONDITION, conditionNumber),
      getSelectorByClassNames('property-name-wrapper'),
      getSelectorByClassNames('bootstrap-typeahead-input', 'input-main'),
    ]);

  return getRelativeSelector([keySelectors.ruleContainer(ruleNumber), propertyNameSelector]);
};

keySelectors.conditionDeleteButton = (ruleNumber, conditionNumber) => {
  const propertyNameSelector =
    getRelativeSelector([
      _getSelectorByIndex(keySelectors.RULE_CONDITION, conditionNumber),
      getSelectorByClassNames('delete-condition-button'),
    ]);

  return getRelativeSelector([keySelectors.ruleContainer(ruleNumber), propertyNameSelector]);
};

keySelectors.ruleValueInput = (ruleIndex, isValueContainsSuggestions) => {
  if (isValueContainsSuggestions)
    return getRelativeSelector([
      keySelectors.ruleContainer(ruleIndex),
      getSelectorByClassNames('rule-value-container'),
      getSelectorByClassNames('bootstrap-typeahead-input', 'input-main')]);

  return getRelativeSelector([
    keySelectors.ruleContainer(ruleIndex),
    getSelectorByClassNames('rule-value-container'),
    'input']);
};

keySelectors.partitionDeleteButton = (partitionIndex) => {
  const partitionsSelector = getSelectorByClassNames('partitions-selector-container', 'tag-delete-button');
  return _getSelectorByIndex(partitionsSelector, partitionIndex);
};

keySelectors.partitionGroup = (groupIndex) => {
  const headerSelector = getSelectorByClassNames('partitions-accordion-container-item');
  return groupIndex ? _getSelectorByIndex(headerSelector, groupIndex) : headerSelector;
};

keySelectors.partitionGroupDeleteButton = (groupIndex) => {
  return getRelativeSelector([
    keySelectors.partitionGroup(groupIndex),
    getSelectorByClassNames('partitions-accordion-container-item-title'),
    'button']);
};

keySelectors.partitionSuggestionByIndex = (suggestionIndex) => {
  return getRelativeSelector([
    getSelectorByClassNames('partitions-selector-container', 'tags-suggestion'),
    _getSelectorByIndex('li', suggestionIndex),
  ]);
};

keySelectors.newPartitionGroupInput = (partitionIndex) => {
  return getRelativeSelector([
    _getSelectorByIndex(getSelectorByClassNames('new-partition-container', 'new-partition-item-container'), partitionIndex),
    'input'
  ]);
};

export default keySelectors;

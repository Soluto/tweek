/* global browser */

import moment from 'moment';
import keySelectors from '../selectors/keySelectors';
import globalSelectors from '../selectors/globalSelectors';
import { getRelativeSelector } from '../selectors/selectorUtils';

export const BLANK_KEY_NAME = '_blank';

export default class KeysPage {
  static TEST_KEYS_FOLDER = '@behavior_tests';
  static GIT_TRANSACTION_TIMEOUT = 5000;
  static KEYS_PAGE_URL = 'keys';

  static goToBase() {
    browser.url("/");
    browser.acceptAlertIfPresent();

    browser.waitForVisible(keySelectors.ADD_KEY_BUTTON, KeysPage.GIT_TRANSACTION_TIMEOUT);
  }

  static goToKeyUrl(keyName) {
    const goTo = `/${KeysPage.KEYS_PAGE_URL}/${keyName}`;

    browser.url(goTo);

    browser.acceptAlertIfPresent();

    KeysPage.waitForPageToLoad();
  }

  static goToKey(keyName) {
    KeysPage.goToKeyUrl(keyName);

    const selectorToWaitFor = keyName.startsWith(BLANK_KEY_NAME) ?
      keySelectors.KEY_NAME_INPUT : keySelectors.KEY_DISPLAY_NAME;

    browser.waitForVisible(selectorToWaitFor, KeysPage.GIT_TRANSACTION_TIMEOUT);
  }

  static goToKeysList() {
    browser.url(`/keys`);
    browser.waitForVisible(keySelectors.KEY_LIST_FILTER, 10000);
  }

  static getKeySource() {
    browser.clickWhenVisible(keySelectors.SOURCE_TAB_ITEM, 2000);
    browser.waitForVisible('.monaco-editor', 5000);
    const keySourceCode = browser.execute(function () {
      return window.monaco.editor.getModels()[0].getValue();
    });
    browser.click(keySelectors.RULES_TAB_ITEM);
    return JSON.parse(keySourceCode.value);
  }

  static setKeySource(source, timeout = 5000) {
    browser.waitForVisible('.monaco-editor', timeout);
    browser.execute(function (source) {
      window.monaco.editor.getModels()[0].setValue(source);
    }, source);
  }

  static getNumberOfRules() {
    return browser.elements(keySelectors.ruleContainer()).value.length;
  }

  static addEmptyKey(keyName, keyValueType = 'String') {
    console.log('adding key', keyName);
    KeysPage.goToKey(BLANK_KEY_NAME);

    browser.waitForVisible(keySelectors.KEY_NAME_INPUT, 5000);
    browser.setValue(keySelectors.KEY_NAME_INPUT, keyName);
    browser.leftClick(globalSelectors.BACKGROUND, 0, 0);
    browser.setValue(keySelectors.KEY_VALUE_TYPE_INPUT, keyValueType);

    browser.click(keySelectors.SAVE_CHANGES_BUTTON);
    browser.waitUntil(() =>
        KeysPage.isInKeyPage(keyName),
      KeysPage.GIT_TRANSACTION_TIMEOUT);

    browser.waitForVisible(keySelectors.KEY_DISPLAY_NAME, KeysPage.GIT_TRANSACTION_TIMEOUT);
  }

  static isInKeyPage(keyName) {
    const location = browser.getUrl();
    return location.endsWith(`${KeysPage.KEYS_PAGE_URL}/${keyName}`);
  }

  static isSaving() {
    return browser.getAttribute(keySelectors.SAVE_CHANGES_BUTTON, 'data-state-is-saving') === 'true';
  }

  static hasChanges() {
    return browser.getAttribute(keySelectors.SAVE_CHANGES_BUTTON, 'data-state-has-changes') === 'true';
  }

  static isSaveButtonDisabled() {
    return browser.getAttribute(keySelectors.SAVE_CHANGES_BUTTON, 'disabled') === 'true';
  }

  static clickOnFolder(folderName) {
    const folderSelector = keySelectors.folder(folderName);

    browser.waitForVisible(folderSelector, 2000);
    browser.click(folderSelector);
  }

  static clickOnKeyLink(keyName) {
    const keyLinkSelector = keySelectors.keyLink(keyName);

    browser.waitForVisible(keyLinkSelector, 2000);
    browser.click(keyLinkSelector);
  }

  static navigateToKey(keyFullPath) {
    const keyFolders = keyFullPath.split('/');
    const keyName = keyFolders.pop();

    let partialFolderPath = '';
    keyFolders.forEach(folder => {
      partialFolderPath += folder;
      KeysPage.clickOnFolder(partialFolderPath);
      partialFolderPath += '/';
    });

    KeysPage.clickOnKeyLink(partialFolderPath + keyName);
  }

  static enterFilterInKeysList(filter) {
    const keyListFilterSelector = keySelectors.KEY_LIST_FILTER;

    browser.waitForVisible(keyListFilterSelector, 1000);
    browser.click(keyListFilterSelector);
    browser.setValue(keyListFilterSelector, filter);
  }

  static waitForKeyToBeDeleted(keyName) {
    const checkIsKeyWasDeleted = (keyName) => {
      KeysPage.goToKeyUrl(keyName);
      return browser.isExisting(keySelectors.NONE_EXISTING_KEY);
    };

    browser.waitUntil(() => checkIsKeyWasDeleted(keyName), KeysPage.GIT_TRANSACTION_TIMEOUT);
  }

  static waitForPageToLoad() {
    browser.waitForVisible(keySelectors.KEY_PAGE, KeysPage.GIT_TRANSACTION_TIMEOUT);
  }

  static waitForKeyToLoad(timeout = 10000) {
    browser.waitForVisible(keySelectors.SAVE_CHANGES_BUTTON, timeout);
  }

  static generateTestKeyName(prefix) {
    const currentDate = new Date();
    return `${prefix}_${moment(currentDate).format('DD_MM_YYYY_HH_mm_ss')}`;
  }

  static acceptRodalIfRaised() {
    browser.clickIfVisible(keySelectors.ALERT_OK_BUTTON, 500);
  }

  static setConditionProperty(ruleNumber, conditionNumber, value) {
    const conditionPropertyInputSelector = keySelectors.conditionPropertyName(ruleNumber, conditionNumber);
    browser.setValue(conditionPropertyInputSelector, value);
    const suggestionSelector = `[data-comp= property-suggestion][data-value= "${value}"]`;
    browser.waitForVisible(suggestionSelector, 5000);
    browser.click(suggestionSelector);
  }

  static setConditionValue(ruleNumber, conditionNumber, value) {
    const conditionValueInputSelector = keySelectors.conditionValue(ruleNumber, conditionNumber);
    browser.waitForEnabled(conditionValueInputSelector, 5000);
    browser.setValue(conditionValueInputSelector, value);
  }

  static addRuleCondition(ruleNumber) {
    const ruleSelector = keySelectors.ruleContainer(ruleNumber);
    const addConditionButtonSelector = getRelativeSelector([ruleSelector, keySelectors.ADD_CONDITION_BUTTON]);
    browser.click(addConditionButtonSelector);
    browser.leftClick(globalSelectors.BACKGROUND, 0, 0);
  }

  static removeRuleCondition(ruleNumber, conditionNumber) {
    const conditionDeleteButtonSelector = keySelectors.conditionDeleteButton(ruleNumber, conditionNumber);
    browser.click(conditionDeleteButtonSelector);
  }

  static setRuleValue(ruleNumber, value, keyValueType) {
    const ruleValueInputSelector = keySelectors.ruleValueInput(ruleNumber, keyValueType === "Boolean");
    browser.setValue(ruleValueInputSelector, value);
  }

  static addPartitionFromProperty(property) {
    browser.setValue(keySelectors.ADD_PARTITION_INPUT, property);
    browser.keys('\uE007');
  }

  static commitChanges(selector = keySelectors.SAVE_CHANGES_BUTTON) {
    browser.click(selector);
    browser.waitUntil(() => !KeysPage.hasChanges() && !KeysPage.isSaving(), KeysPage.GIT_TRANSACTION_TIMEOUT, "changes were not saved");
  }
}
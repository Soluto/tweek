import { getRelativeSelector, selectors } from './selectors';
import moment from 'moment';
import nconf from 'nconf';

const BLANK_KEY_NAME = '_blank';

export default class KeysPageObject {

  static BASE_URL = nconf.get('BACKOFFICE_URL');
  static KEYS_PAGE_URL = 'keys';
  static TEST_KEYS_FOLDER = '@behavior_tests';
  static GIT_TRANSACTION_TIMEOUT = 60000;

  constructor(browser) {
    this.browser = browser;
  }

  getUrlLocation() {
    const location = this.browser.getUrl().split(KeysPageObject.BASE_URL)[1];

    return location;
  }

  goToBase() {
    this.browser.url(KeysPageObject.BASE_URL);
    this.browser.acceptAlertIfPresent();

    this.browser.waitForVisible(selectors.ADD_KEY_BUTTON, KeysPageObject.GIT_TRANSACTION_TIMEOUT);
  }

  goToKeyUrl(keyName) {
    const goTo = `${KeysPageObject.BASE_URL}${KeysPageObject.KEYS_PAGE_URL}/${keyName}`;

    this.browser.url(goTo);

    this.browser.acceptAlertIfPresent();

    this.waitForPageToLoad();
  }

  goToKey(keyName) {
    this.goToKeyUrl(keyName);

    const selectorToWaitFor = keyName.startsWith(BLANK_KEY_NAME) ?
      selectors.KEY_NAME_INPUT : selectors.KEY_DISPLAY_NAME;

    this.browser.waitForVisible(selectorToWaitFor, KeysPageObject.GIT_TRANSACTION_TIMEOUT);
  }

  goToKeysList() {
    this.browser.url(`${KeysPageObject.BASE_URL}keys`);
    this.browser.waitForVisible(selectors.KEY_LIST_FILTER, 10000);
  }

  getKeySource() {
    this.browser.waitForVisible(selectors.TAB_ITEM_HEADER, 2000);
    this.browser.click(selectors.SOURCE_TAB_ITEM);
    const keySourceCode = this.browser.getHTML(selectors.KEY_SOURCE_TEXT, false);
    this.browser.click(selectors.RULES_TAB_ITEM);
    return JSON.parse(keySourceCode);
  }

  getNumberOfRules() {
    return this.browser.elements(selectors.ruleContainer()).value.length;
  }

  addEmptyKey(keyName, keyValueType = 'String') {
    console.log('adding key', keyName);
    this.goToKey(BLANK_KEY_NAME);

    this.browser.waitForVisible(selectors.KEY_NAME_INPUT, 5000);
    this.browser.setValue(selectors.KEY_NAME_INPUT, keyName);
    browser.click(selectors.BACKGROUND);

    this.browser.setValue(selectors.KEY_VALUE_TYPE_INPUT, keyValueType);
    const firstSuggestion = selectors.typeaheadSuggestionByIndex(0);
    browser.click(firstSuggestion);

    this.browser.click(selectors.SAVE_CHANGES_BUTTON);
    this.browser.waitUntil(() =>
      this.isInKeyPage(keyName),
      KeysPageObject.GIT_TRANSACTION_TIMEOUT);

    this.browser.waitForVisible(selectors.KEY_DISPLAY_NAME, KeysPageObject.GIT_TRANSACTION_TIMEOUT);
  }

  isInKeyPage(keyName) {
    const location = this.getUrlLocation();
    return location === `${KeysPageObject.KEYS_PAGE_URL}/${keyName}`;
  }

  isSaving() {
    return this.browser.getAttribute(selectors.SAVE_CHANGES_BUTTON, 'data-state-is-saving') === 'true';
  }

  hasChanges() {
    return this.browser.getAttribute(selectors.SAVE_CHANGES_BUTTON, 'data-state-has-changes') === 'true';
  }

  isSaveButtonDisabled() {
    return this.browser.getAttribute(selectors.SAVE_CHANGES_BUTTON, 'disabled') === 'true';
  }

  clickOnFolder(folderName) {
    const folderSelector = selectors.folder(folderName);

    this.browser.waitForVisible(folderSelector, 2000);
    this.browser.click(folderSelector);
  }

  clickOnKeyLink(keyName) {
    const keyLinkSelector = selectors.keyLink(keyName);

    this.browser.waitForVisible(keyLinkSelector, 2000);
    this.browser.click(keyLinkSelector);
  }

  navigateToKey(keyFullPath) {
    const keyFolders = keyFullPath.split('/');
    const keyName = keyFolders.pop();

    let partialFolderPath = '';
    keyFolders.forEach(folder => {
      partialFolderPath += folder;
      this.clickOnFolder(partialFolderPath);
      partialFolderPath += '/';
    });

    this.clickOnKeyLink(partialFolderPath + keyName);
  }

  enterFilterInKeysList(filter) {
    const keyListFilterSelector = selectors.KEY_LIST_FILTER;

    this.browser.waitForVisible(keyListFilterSelector, 1000);
    this.browser.click(keyListFilterSelector);
    this.browser.setValue(keyListFilterSelector, filter);
  }

  wait(delayInMs, printWait = true) {
    if (printWait) console.log('wait', delayInMs, 'ms');
    this.browser.pause(delayInMs);
  }

  waitForKeyToBeDeleted(keyName) {
    const checkIsKeyWasDeleted = (keyName) => {
      this.goToKeyUrl(keyName);
      return this.browser.isExisting(selectors.NONE_EXISTING_KEY);
    };

    this.browser.waitUntil(() => checkIsKeyWasDeleted(keyName), KeysPageObject.GIT_TRANSACTION_TIMEOUT);
  }

  waitForPageToLoad() {
    this.browser.waitForVisible(selectors.KEY_PAGE, KeysPageObject.GIT_TRANSACTION_TIMEOUT);
  }

  waitForKeyToLoad(timeout = 10000) {
    this.browser.waitForVisible(selectors.DELETE_KEY_BUTTON, timeout);
  }

  generateTestKeyName(prefix) {
    const currentDate = new Date();
    return `${prefix}_${moment(currentDate).format('DD_MM_YYYY_HH_mm_ss')}`;
  }

  acceptRodalIfRaised() {
    this.browser.clickIfVisible(selectors.ALERT_OK_BUTTON, 500);
  }

  setConditionPropertyFromSuggestion(ruleNumber, conditionNumber, suggestionIndex) {
    const conditionPropertyInputSelector = selectors.conditionPropertyName(ruleNumber, conditionNumber);
    const suggestionSelector = selectors.typeaheadSuggestionByIndex(suggestionIndex);

    this.browser.click(selectors.BACKGROUND);
    this.browser.click(conditionPropertyInputSelector);
    this.browser.click(suggestionSelector);
  }

  setConditionPropertyFromSuggestionValuePrefix(ruleNumber, conditionNumber, valuePrefix) {
    const conditionPropertyInputSelector = selectors.conditionPropertyName(ruleNumber, conditionNumber);
    this.browser.setValue(conditionPropertyInputSelector, valuePrefix);
    const suggestionSelector = selectors.typeaheadSuggestionByIndex(0);
    this.browser.click(suggestionSelector);
  }

  setConditionValue(ruleNumber, conditionNumber, value) {
    const conditionValueInputSelector = selectors.conditionValue(ruleNumber, conditionNumber);
    this.browser.setValue(conditionValueInputSelector, value);
  }

  addRuleCondition(ruleNumber) {
    const ruleSelector = selectors.ruleContainer(ruleNumber);
    const addConditionButtonSelector = getRelativeSelector([ruleSelector, selectors.ADD_CONDITION_BUTTON]);
    this.browser.click(addConditionButtonSelector);
    this.browser.click(selectors.BACKGROUND);
  }

  removeRuleCondition(ruleNumber, conditionNumber) {
    const conditionDeleteButtonSelector = selectors.conditionDeleteButton(ruleNumber, conditionNumber);
    this.browser.click(conditionDeleteButtonSelector);
  }

  setRuleValue(ruleNumber, value, keyValueType) {
    const ruleValueInputSelector = selectors.ruleValueInput(ruleNumber, keyValueType == "Boolean");
    this.browser.setValue(ruleValueInputSelector, value);
    if (keyValueType == "Boolean") {
      const firstSuggestion = selectors.typeaheadSuggestionByIndex(0);
      browser.click(firstSuggestion);
    }
  }

  addPartitionFromProperty(property) {
    this.browser.setValue(selectors.ADD_PARTITION_INPUT, property);
    this.browser.keys('\uE007');
  }

  addPartitionFromSuggestion(suggestion) {
    this.browser.setValue(selectors.ADD_PARTITION_INPUT, suggestion);
    this.browser.clickWhenVisible(selectors.partitionSuggestionByIndex(0), 1000);
  }

  saveChanges() {
    this.browser.click(selectors.SAVE_CHANGES_BUTTON);
    this.browser.waitUntil(() => this.isSaving(), 5000, 'should move to in saving state');
    this.browser.waitUntil(() => !this.isSaving(), KeysPageObject.GIT_TRANSACTION_TIMEOUT);
  }
}
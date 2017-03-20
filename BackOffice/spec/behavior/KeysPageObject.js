import { getRelativeSelector, selectors } from './selectors';
import moment from 'moment';
import { BLANK_KEY_NAME } from '../../modules/store/ducks/ducks-utils/blankKeyDefinition';

export default class KeysPageObject {

  static BASE_URL = 'http://127.0.0.1:4000/';
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
    if (this.didAlertRaised())
      this.browser.alertAccept();

    this.browser.waitForVisible(selectors.ADD_KEY_BUTTON, KeysPageObject.GIT_TRANSACTION_TIMEOUT);
  }

  goToKey(keyName) {
    const goTo = `${KeysPageObject.BASE_URL}${KeysPageObject.KEYS_PAGE_URL}/${keyName}`;

    this.browser.url(goTo);

    if (this.didAlertRaised()) {
      this.browser.alertAccept();
    }

    const selectorToWaitFor = keyName.startsWith(BLANK_KEY_NAME) ?
      selectors.KEY_NAME_INPUT : selectors.KEY_DISPLAY_NAME;

    this.browser.waitForVisible(selectorToWaitFor, KeysPageObject.GIT_TRANSACTION_TIMEOUT);
  }

  goToKeysList() {
    this.browser.url(`${KeysPageObject.BASE_URL}keys`);
    this.browser.waitForVisible(selectors.KEY_LIST_FILTER, 10000);
  }

  getNumberOfRules() {
    return this.browser.elements(selectors.ruleContainer()).value.length;
  }

  deleteKeyIfExists(keyName) {
    try {
      this.goToKey(keyName);
      this.browser.click(selectors.DELETE_KEY_BUTTON);
      this.browser.alertAccept();

      console.log('deleting key', keyName);
      this.waitForKeyToBeDeleted(keyName);
    } catch (exp) { }
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
      try {
        this.goToKey(keyName);
        return false;
      } catch (exp) {
        return true;
      }
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

  didAlertRaised() {
    try {
      this.browser.alertText();
      return true;
    } catch (exp) {
      return false;
    }
  }

  setConditionPropertyFromSuggestion(ruleNumber, conditionNumber, suggestionIndex) {
    const conditionPropertyInputSelector = selectors.conditionPropertyName(ruleNumber, conditionNumber)
    const suggestionSelector = selectors.typeaheadSuggestionByIndex(suggestionIndex);

    this.browser.click(selectors.BACKGROUND);
    this.browser.click(conditionPropertyInputSelector);
    this.browser.click(suggestionSelector);
  }

  setConditionPropertyFromSuggestionValuePrefix(ruleNumber, conditionNumber, valuePrefix) {
    const conditionPropertyInputSelector = selectors.conditionPropertyName(ruleNumber, conditionNumber)
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
}
import { selectors } from './selectors';
import moment from 'moment';
import { BLANK_KEY_NAME } from '../../modules/store/ducks/ducks-utils/blankKeyDefinition';

export default class KeysPageObject {

  static BASE_URL = 'http://127.0.0.1:4000/';
  static KEYS_PAGE_URL = 'keys';
  static TEST_KEYS_FOLDER = '@behavior-tests';
  static GIT_TRANSACTION_TIMEOUT = 30000;

  constructor(browser) {
    this.browser = browser;
  }

  getUrlLocation() {
    this.browser.waitUntil(() => !!this.browser.getUrl(), 5000);
    const location = this.browser.getUrl().split(KeysPageObject.BASE_URL)[1];

    return location;
  }

  goToKey(keyName) {
    this.browser.url(`${KeysPageObject.BASE_URL}${KeysPageObject.KEYS_PAGE_URL}/${keyName}`);
    this.waitForVisible(selectors.SAVE_CHANGES_BUTTON, 10000, 'key: ' + keyName + ' didnt added correctly');
  }

  deleteKeyIfExists(keyName) {
    try {
      this.goToKey(keyName);
      this.browser.click(selectors.DELETE_KEY_BUTTON);
      this.browser.alertAccept();

      console.log('deleting key', keyName);
    } catch (exp) { }
  }

  addEmptyKey(keyName) {
    console.log('adding key', keyName);
    this.goToKey(BLANK_KEY_NAME);

    this.waitForVisible(selectors.KEY_NAME_INPUT, 5000);
    this.browser.setValue(selectors.KEY_NAME_INPUT, keyName);

    this.browser.click(selectors.SAVE_CHANGES_BUTTON);

    this.browser.waitUntil(() =>
      this.isInKeyPage(keyName),
      KeysPageObject.GIT_TRANSACTION_TIMEOUT);

    this.waitForVisible(selectors.DELETE_KEY_BUTTON, 10000, 'key: ' + keyName + ' didnt added correctly');
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

    this.browser.waitForVisible(folderSelector, 1000);
    this.browser.click(folderSelector);
  }

  clickOnKeyLink(keyName) {
    const keyLinkSelector = selectors.keyLink(keyName);

    this.browser.waitForVisible(keyLinkSelector, 1000);
    this.browser.click(keyLinkSelector);
  }

  wait(delayInMs) {
    console.log('wait', delayInMs, 'ms');
    let isDone = false;

    setTimeout(() => isDone = true, delayInMs);

    this.browser.waitUntil(() => isDone, delayInMs + 200);
  }

  waitForPageToLoad() {
    this.browser.waitForVisible(selectors.KEY_PAGE, 2000);
  }

  waitForKeyToLoad(timeout = 10000) {
    this.browser.waitForVisible(selectors.DELETE_KEY_BUTTON, timeout);
  }

  waitForVisible(selector, timeout, exceptionMessage) {
    try {
      this.browser.waitForVisible(selector, timeout);
    } catch (exp) {
      throw exp.message + ' from keyPageObject.waitForVisible: ' + exceptionMessage;
    }
  }

  generateTestKeyName(prefix) {
    const currentDate = new Date();
    return `${prefix}-${moment(currentDate).format('DD-MM-YYYY-HH-mm-ss')}`;
  }
}
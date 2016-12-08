import { selectors } from './selectors';
import moment from 'moment';

export default class KeysPageObject {

  // static BASE_URL = 'http://localhost:8080/';
  static BASE_URL = 'http://127.0.0.1:90/';
  static KEYS_PAGE_URL = 'keys';

  constructor(browser) {
    this.browser = browser;
  }

  getUrlLocation() {
    const location = this.browser.getUrl().split(KeysPageObject.BASE_URL)[1];
    return location;
  }

  goToKey(keyName) {
    this.browser.url(`${KeysPageObject.BASE_URL}${KeysPageObject.KEYS_PAGE_URL}/${keyName}`);
    this.waitForKeyToLoad();
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
    this.goToKey('_blank');

    this.browser.setValue(selectors.KEY_PATH_INPUT, keyName);
    this.browser.click(selectors.SAVE_CHANGES_BUTTON);

    this.browser.waitUntil(() =>
      this.isInKeyPage(keyName),
      1000000/*TODO: REMOVE afater test passes in circle !!!!!!!*/);
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
    let isDone = false;

    setTimeout(() => isDone = true, delayInMs);

    this.browser.waitUntil(() => isDone, delayInMs + 10);
  }

  waitForPageToLoad() {
    this.browser.waitForVisible(selectors.KEY_PAGE, 2000);
  }

  waitForKeyToLoad(timeout = 2000) {
    this.browser.waitForVisible(selectors.SAVE_CHANGES_BUTTON, timeout);
  }

  generateKeyName(prefix) {
    const currentDate = new Date();
    return `${prefix}-${moment(currentDate).format('DD-MM-YYYY-HH-mm-ss')}`;
  }
}

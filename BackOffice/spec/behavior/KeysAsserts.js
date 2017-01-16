import assert from 'assert';
import KeysPageObject from './KeysPageObject';
import PageAsserts from './PageAsserts';
import { selectors } from './selectors';

export default class KeysAsserts {

  constructor(keysPageObject, browser) {
    this.keysPageObject = keysPageObject;
    this.browser = browser;
    this.pageAsserts = new PageAsserts(keysPageObject);
  }

  assertKeyOpened(keyName) {
    this.assertIsInKeyPage(keyName, `should be in ${keyName} key page`);
    assert(!this.keysPageObject.hasChanges(), 'should not has changes');
    assert(!this.keysPageObject.isSaving(), 'should not be in saving state');
  }

  assertKeySource(keySource, expectedSource, message = 'key source should be correct') {
    const keySourceObject = JSON.parse(keySource);
    const expectedKeySourceObject = JSON.parse(keySource);

    const deleteIds = (sourceObject) => {
      sourceObject.forEach(matcher => { delete matcher['Id']; });
    };

    deleteIds(keySourceObject);
    deleteIds(expectedKeySourceObject);

    assert(keySourceObject, expectedKeySourceObject, message);
  }

  assertKeyHasNumberOfRules(expectedNumberOfRules, message = 'should have correct ammount of rules') {
    assert.equal(this.keysPageObject.getNumberOfRules(), expectedNumberOfRules, message);
  }

  assertKeyHasDefaultValueRule(message = 'should have default value rule') {
    assert(this.browser.isExisting(selectors.DEFAULT_VALUE_RULE), message);
  }

  assertIsInKeyPage(expectedKey, message) {
    this.pageAsserts.assertIsInPage(`${KeysPageObject.KEYS_PAGE_URL}/${expectedKey}`, message);
  }

  assertIsKeyExistsAfterTransaction(keyName, isExisting, message) {
    this.keysPageObject.waitForKeyToBeDeleted(keyName);
    const currentUrl = this.browser.getUrl();

    let isKeyExists;

    try {
      this.keysPageObject.goToKey(keyName);
      isKeyExists = this.browser.isExisting(selectors.KEY_VIEWER_CONTAINER);
    } catch (exp) {
      isKeyExists = false;
    } finally {
      assert(isExisting === isKeyExists, message);

      this.browser.url(currentUrl);
      this.keysPageObject.waitForPageToLoad();
    }
  }
}

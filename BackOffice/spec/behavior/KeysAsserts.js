import assert from 'assert';
import KeysPageObject from './KeysPageObject';
import PageAsserts from './PageAsserts';
import { selectors } from './selectors';
import { expect } from 'chai';
import { diff } from 'deep-diff';

export default class KeysAsserts {

  constructor(keysPageObject, browser) {
    this.keysPageObject = keysPageObject;
    this.browser = browser;
    this.pageAsserts = new PageAsserts(keysPageObject);
  }

  assertKeyOpened(keyName) {
    this.assertIsInKeyPage(keyName, `should be in ${keyName} key page`);
    browser.waitForVisible(selectors.KEY_VIEWER_CONTAINER, 4000);
    assert(!this.keysPageObject.hasChanges(), 'should not has changes');
    assert(!this.keysPageObject.isSaving(), 'should not be in saving state');
  }

  assertKeySource(expectedSourceObject, message = 'key source should be correct') {
    browser.waitForVisible(selectors.TAB_ITEM_HEADER, 2000);
    browser.click(selectors.SOURCE_TAB_ITEM);
    const keySourceCode = browser.getHTML(selectors.KEY_SOURCE_TEXT, false);
    browser.click(selectors.RULES_TAB_ITEM);
    let keySourceObject;
    try {
      keySourceObject = JSON.parse(keySourceCode);
    }
    catch (exp) {
      assert(false, 'failed read key source, ' + exp);
    }

    const deleteIds = (sourceObject) => {
      sourceObject.rules.forEach(matcher => { delete matcher['Id']; });
    };

    deleteIds(keySourceObject);
    deleteIds(expectedSourceObject);

    const diffs = diff(keySourceObject, expectedSourceObject);
    expect(diffs).to.equal(undefined, message + '. diffs are:' + JSON.stringify(diffs));
  }

  assertKeyHasNumberOfRules(expectedNumberOfRules, message = 'should have correct ammount of rules') {
    assert.equal(this.keysPageObject.getNumberOfRules(), expectedNumberOfRules, message);
  }

  assertIsInKeyPage(expectedKey, message) {
    this.pageAsserts.assertIsInPage(`${KeysPageObject.KEYS_PAGE_URL}/${expectedKey}`, message);
  }

  assertIsKeyExistsAfterTransaction(keyName, isExisting, message) {
    this.keysPageObject.waitForKeyToBeDeleted(keyName);
    const currentUrl = this.browser.getUrl();

    let isKeyExists;

    try {
      this.keysPageObject.getToKeyUrl(keyName);
      this.keysPageObject.waitForPageToLoad();
      isKeyExists = this.browser.isExisting(selectors.KEY_VIEWER_CONTAINER);
    } catch (exp) {
      isKeyExists = false;
    } finally {
      assert(isExisting === isKeyExists, message);

      if (currentUrl != this.browser.getUrl()) {
        this.browser.url(currentUrl);
        this.keysPageObject.waitForPageToLoad();
      }
    }
  }
}

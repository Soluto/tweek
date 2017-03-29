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
    let keySourceObject;
    try {
      keySourceObject = this.keysPageObject.getKeySource();
    }
    catch (exp) {
      assert(false, 'failed read key source, ' + exp);
    }

    const deleteIds = (rulesObject, depth) => {
      if (depth == 0) {
        rulesObject.forEach(matcher => { delete matcher['Id']; });
        return;
      }
      Object.keys(rulesObject).forEach(key => deleteIds(rulesObject[key], depth -1));
    };

    deleteIds(keySourceObject.rules, keySourceObject.partitions.length);
    deleteIds(expectedSourceObject.rules, expectedSourceObject.partitions.length);

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
    if (!isExisting) this.keysPageObject.waitForKeyToBeDeleted(keyName);
    const currentUrl = this.browser.getUrl();

    this.keysPageObject.goToKeyUrl(keyName);
    assert(isExisting === this.browser.isExisting(selectors.KEY_VIEWER_CONTAINER), message);

    if (currentUrl != this.browser.getUrl()) {
      this.browser.url(currentUrl);
      this.keysPageObject.waitForPageToLoad();
    }
  }
}

/* global describe, before, after, it, browser */

import KeysAsserts from '../KeysAsserts';
import KeysPageObject from '../KeysPageObject';
import assert from 'assert';
import { selectors } from '../selectors';


describe('keys list and filter', () => {
  const keysPageObject = new KeysPageObject(browser);
  const keyAsserts = new KeysAsserts(keysPageObject, browser);

  const testFolder = KeysPageObject.TEST_KEYS_FOLDER;
  const keysListTestFolder = '@keysList';

  const greenAppleKeyFullPath = `${testFolder}/${keysListTestFolder}/greenApple`;
  const redAppleKeyFullPath = `${testFolder}/${keysListTestFolder}/redApple`;
  const bananaAppleKeyFullPath = `${testFolder}/${keysListTestFolder}/banana`;

  before(() => {
    browser.url(KeysPageObject.BASE_URL);
  });

  it("should be able to navigate to key by folders", () => {
    keysPageObject.goToKeysList();

    keysPageObject.navigateToKey(greenAppleKeyFullPath);

    keyAsserts.assertIsInKeyPage(greenAppleKeyFullPath);
  });

  it("should display matching keys when filtering", () => {
    browser.url(KeysPageObject.BASE_URL);

    keysPageObject.enterFilterInKeysList("Apple");

    browser.waitForVisible(selectors.keyLink(greenAppleKeyFullPath), 2000);
    browser.waitForVisible(selectors.keyLink(redAppleKeyFullPath), 2000);

    assert(!browser.isVisible(selectors.keyLink(bananaAppleKeyFullPath)), 'should show banana key in keys list');
  });
});
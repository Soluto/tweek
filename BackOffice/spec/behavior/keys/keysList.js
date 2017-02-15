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
  const bananaKeyFullPath = `${testFolder}/${keysListTestFolder}/banana`;

  before(() => {
    keysPageObject.goToBase();
  });

  it("should be able to navigate to key by folders", () => {
    keysPageObject.goToKeysList();

    keysPageObject.navigateToKey(greenAppleKeyFullPath);

    keyAsserts.assertIsInKeyPage(greenAppleKeyFullPath);
  });

  it("should display matching keys when filtering", () => {
    keysPageObject.enterFilterInKeysList("Apple");

    keysPageObject.wait(500);

    browser.waitForVisible(selectors.keyLink(greenAppleKeyFullPath), 2000);
    browser.waitForVisible(selectors.keyLink(redAppleKeyFullPath), 2000);

    let isBananaVisible = browser.isVisible(selectors.keyLink(bananaKeyFullPath));

    assert(!isBananaVisible, "shouldn't show banana key in keys list");
  });
});
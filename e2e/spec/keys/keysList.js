/* global describe, before, after, it, browser */

import KeysAsserts from '../../KeysAsserts';
import KeysPage from '../../utils/KeysPage';
import selectors from '../../selectors/keySelectors';

describe('keys list and filter', () => {
  const testFolder = KeysPage.TEST_KEYS_FOLDER;
  const keysListTestFolder = '@keys_list';

  const greenAppleKeyFullPath = `${testFolder}/${keysListTestFolder}/green_apple`;
  const redAppleKeyFullPath = `${testFolder}/${keysListTestFolder}/red_apple`;
  const bananaKeyFullPath = `${testFolder}/${keysListTestFolder}/banana`;

  before(() => {
    KeysPage.goToBase();
  });

  it("should be able to navigate to key by folders", () => {
    KeysPage.goToKeysList();

    KeysPage.navigateToKey(greenAppleKeyFullPath);

    KeysAsserts.assertIsInKeyPage(greenAppleKeyFullPath);
  });

  it("should display matching keys when filtering", () => {
    KeysPage.enterFilterInKeysList("apple");

    browser.waitForVisible(selectors.keyLink(greenAppleKeyFullPath), 2000);
    browser.waitForVisible(selectors.keyLink(redAppleKeyFullPath), 2000);
    browser.waitForVisible(selectors.keyLink(bananaKeyFullPath), 2000, true);
  });
});
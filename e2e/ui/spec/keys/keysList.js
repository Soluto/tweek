/* global describe, before, after, it, browser */

import * as KeysAsserts from '../../utils/key-asserts';
import * as KeyUtils from '../../utils/KeysPage';
import selectors from '../../selectors/keySelectors';

describe('keys list and filter', () => {
  const testFolder = '@behavior_tests';
  const keysListTestFolder = '@keys_list';

  const greenAppleKeyFullPath = `${testFolder}/${keysListTestFolder}/green_apple`;
  const redAppleKeyFullPath = `${testFolder}/${keysListTestFolder}/red_apple`;
  const bananaKeyFullPath = `${testFolder}/${keysListTestFolder}/banana`;

  before(() => {
    KeyUtils.goToKey();
  });

  it('should be able to navigate to key by folders', () => {
    KeyUtils.navigateToKey(greenAppleKeyFullPath);

    KeysAsserts.assertIsInKeyPage(greenAppleKeyFullPath);
  });

  it('should display matching keys when filtering', () => {
    KeyUtils.searchKey('apple');

    browser.waitForVisible(selectors.keyLink(greenAppleKeyFullPath), 2000);
    browser.waitForVisible(selectors.keyLink(redAppleKeyFullPath), 2000);
    browser.waitForVisible(selectors.keyLink(bananaKeyFullPath), 2000, true);
  });
});

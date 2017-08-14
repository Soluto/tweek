/* global describe, before, after, it, browser */

import * as KeysAsserts from '../../utils/key-asserts';
import { goToKey, navigateToKey, searchKey } from '../../utils/key-utils';
import { attributeSelector, dataComp } from '../../utils/selector-utils';

describe('keys list and filter', () => {
  const keysListTestFolder = 'behavior_tests/keys_list';

  const greenAppleKeyFullPath = `${keysListTestFolder}/green_apple`;
  const redAppleKeyFullPath = `${keysListTestFolder}/red_apple`;
  const bananaKeyFullPath = `${keysListTestFolder}/banana`;

  const keyLink = keyName =>
    `${dataComp('key-link')} ${attributeSelector('href', `/keys/${keyName}`)}`;

  before(() => {
    goToKey();
  });

  it('should be able to navigate to key by folders', () => {
    navigateToKey(greenAppleKeyFullPath);

    KeysAsserts.assertIsInKeyPage(greenAppleKeyFullPath);
  });

  it('should display matching keys when filtering', () => {
    searchKey('apple');

    browser.waitForVisible(keyLink(greenAppleKeyFullPath), 2000);
    browser.waitForVisible(keyLink(redAppleKeyFullPath), 2000);
    browser.waitForVisible(keyLink(bananaKeyFullPath), 2000, true);
  });
});

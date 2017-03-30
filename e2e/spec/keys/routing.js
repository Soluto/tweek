/* global describe, before, after, beforeEach, it, browser */

import KeysPageObject from '../../KeysPageObject';
import { selectors } from '../../selectors';

const BLANK_KEY_NAME = '_blank';

describe('navigating from key with changes', () => {
  const keysPageObject = new KeysPageObject(browser);

  const testFolder = KeysPageObject.TEST_KEYS_FOLDER;
  const testKey1 = `test_key1`;
  const folderPath = `@routing`;

  const testKey1FullPath = `${testFolder}/${folderPath}/${testKey1}`;

  before(() => {
    browser.windowHandleMaximize();
  });

  beforeEach(() => {
    keysPageObject.goToKey(BLANK_KEY_NAME);
  });

  it('should show confirm message if navigating to another key', () => {
    browser.click(selectors.ADD_RULE_BUTTON);
    browser.waitUntil(() => keysPageObject.hasChanges(), 2000);

    keysPageObject.navigateToKey(testKey1FullPath);

    browser.waitForAlert(1000, 'should show confirm message');
    browser.alertAccept();
  });

  it('should show confirm message if refreshing', () => {
    browser.click(selectors.ADD_RULE_BUTTON);
    browser.waitUntil(() => keysPageObject.hasChanges(), 2000);

    browser.refresh();

    browser.waitForAlert(1000, 'should show confirm message');
    browser.alertAccept();
  });
});

/* global describe, before, after, beforeEach, it, browser */

import KeysPage, { BLANK_KEY_NAME } from '../../utils/KeysPage';
import selectors from '../../selectors/keySelectors';

describe('navigating from key with changes', () => {
  const testFolder = KeysPage.TEST_KEYS_FOLDER;
  const testKey1 = `test_key1`;
  const folderPath = `@routing`;

  const testKey1FullPath = `${testFolder}/${folderPath}/${testKey1}`;

  before(() => {
    browser.windowHandleMaximize();
  });

  beforeEach(() => {
    KeysPage.goToKey(BLANK_KEY_NAME);
  });

  it('should show confirm message if navigating to another key', () => {
    browser.click(selectors.ADD_RULE_BUTTON);
    browser.waitUntil(() => KeysPage.hasChanges(), 2000);

    KeysPage.navigateToKey(testKey1FullPath);

    browser.waitForAlert(1000, 'should show confirm message');
    browser.alertAccept();
  });

  it('should show confirm message if refreshing', () => {
    browser.click(selectors.ADD_RULE_BUTTON);
    browser.waitUntil(() => KeysPage.hasChanges(), 2000);

    browser.refresh();

    browser.waitForAlert(1000, 'should show confirm message');
    browser.alertAccept();
  });
});

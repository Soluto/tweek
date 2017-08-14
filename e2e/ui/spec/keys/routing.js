/* global describe, before, after, beforeEach, it, browser */

import { BLANK_KEY_NAME } from '../../utils/key-utils';
import * as KeyUtils from '../../utils/key-utils';
import selectors from '../../selectors/keySelectors';

describe('navigating from key with changes', () => {
  const testKey1 = `test_key1`;
  const folderPath = `@routing`;

  const testKey1FullPath = `@behavior_tests/${folderPath}/${testKey1}`;

  before(() => {
    browser.windowHandleMaximize();
  });

  beforeEach(() => {
    KeyUtils.goToKey(BLANK_KEY_NAME);
  });

  it('should show confirm message if navigating to another key', () => {
    browser.click(selectors.ADD_RULE_BUTTON);
    browser.waitUntil(() => KeyUtils.hasChanges(), 2000);

    KeyUtils.navigateToKey(testKey1FullPath);

    browser.waitForAlert(1000, 'should show confirm message');
    browser.alertAccept();
  });

  it('should show confirm message if refreshing', () => {
    browser.click(selectors.ADD_RULE_BUTTON);
    browser.waitUntil(() => KeyUtils.hasChanges(), 2000);

    browser.refresh();

    browser.waitForAlert(1000, 'should show confirm message');
    browser.alertAccept();
  });
});

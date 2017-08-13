/* global describe, before, after, it, browser */

import KeysAsserts from '../../KeysAsserts';
import * as KeyUtils from '../../utils/KeysPage';
import assert from 'assert';
import selectors from '../../selectors/keySelectors';

describe('readonly key', () => {
  const testKey = `test_key`;
  const folderPath = `@readonly`;

  const testKeyFullPath = `@behavior_tests/${folderPath}/${testKey}`;

  it('should open the key as readonly', () => {
    KeyUtils.goToKey(testKeyFullPath);
    browser.waitUntil(() => browser.getText(selectors.KEY_DISPLAY_NAME) === testKeyFullPath, 5000);

    assert(browser.isVisible(selectors.READONLY_KEY_MESSAGE), 'should show key is readonly message');

    const numberOfRules = KeyUtils.getNumberOfRules();
    browser.click(selectors.ADD_RULE_BUTTON);
    browser.click(selectors.ADD_RULE_BUTTON);
    KeysAsserts.assertKeyHasNumberOfRules(numberOfRules);
  });
});

/* global describe, before, after, it, browser */

import assert from 'assert';
import * as KeysAsserts from '../../utils/key-asserts';
import * as KeyUtils from '../../utils/key-utils';
import Rule from '../../utils/Rule';
import selectors from '../../selectors/keySelectors';

describe('readonly key', () => {
  const testKey = `test_key`;
  const folderPath = `@readonly`;

  const testKeyFullPath = `@behavior_tests/${folderPath}/${testKey}`;

  it('should open the key as readonly', () => {
    KeyUtils.goToKey(testKeyFullPath);
    browser.waitUntil(() => browser.getText(selectors.KEY_DISPLAY_NAME) === testKeyFullPath, 5000);

    assert(
      browser.isVisible(selectors.READONLY_KEY_MESSAGE),
      'should show key is readonly message',
    );

    const numberOfRules = Rule.count();
    browser.click(selectors.ADD_RULE_BUTTON);
    browser.click(selectors.ADD_RULE_BUTTON);
    KeysAsserts.assertKeyHasNumberOfRules(numberOfRules);
  });
});

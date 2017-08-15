/* global describe, before, after, it, browser */

import assert from 'assert';
import { expect } from 'chai';
import Key from '../../utils/Key';
import Rule from '../../utils/Rule';
import selectors from '../../selectors/keySelectors';

describe('readonly key', () => {
  const testKey = `test_key`;
  const folderPath = `@readonly`;

  const testKeyFullPath = `@behavior_tests/${folderPath}/${testKey}`;

  it('should open the key as readonly', () => {
    Key.open(testKeyFullPath);
    browser.waitUntil(() => Key.displayName === testKeyFullPath, 5000);

    assert(
      browser.isVisible(selectors.READONLY_KEY_MESSAGE),
      'should show key is readonly message',
    );

    const numberOfRules = Rule.count();
    browser.click(selectors.ADD_RULE_BUTTON);
    browser.click(selectors.ADD_RULE_BUTTON);
    expect(Rule.count()).to.equal(numberOfRules);
  });
});

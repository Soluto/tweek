/* global describe, before, after, it, browser */

import KeysAsserts from '../../KeysAsserts';
import KeysPageObject from '../../utils/KeysPageObject';
import assert from 'assert';
import selectors from '../../selectors/keySelectors';

describe('readonly key', () => {
  const keysPageObject = new KeysPageObject(browser);

  const testFolder = KeysPageObject.TEST_KEYS_FOLDER;
  const testKey = `test_key`;
  const folderPath = `@readonly`;

  const testKeyFullPath = `${testFolder}/${folderPath}/${testKey}`;

  const keysAsserts = new KeysAsserts(keysPageObject, browser);

  it('should open the key as readonly', () => {
    keysPageObject.goToKey(testKeyFullPath);
    browser.waitUntil(() => browser.getText(selectors.KEY_DISPLAY_NAME) === testKeyFullPath, 5000);

    assert(browser.isVisible(selectors.READONLY_KEY_MESSAGE), 'should show key is readonly message');

    const numberOfRules = keysPageObject.getNumberOfRules();
    browser.click(selectors.ADD_RULE_BUTTON);
    browser.click(selectors.ADD_RULE_BUTTON);
    keysAsserts.assertKeyHasNumberOfRules(numberOfRules);
  });
});

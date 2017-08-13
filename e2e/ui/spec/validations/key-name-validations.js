/* global describe, before, after, it, browser */

import KeysAsserts from '../../utils/key-asserts';
import { BLANK_KEY_NAME } from '../../utils/KeysPage';
import * as KeyUtils from '../../utils/KeysPage';
import { expect, assert } from 'chai';
import keySelectors from '../../selectors/keySelectors';

describe('key name validations', () => {
  beforeEach(() => {
    KeyUtils.goToKey();
  });

  const testDefenitions = [];
  const setTestDefenition = (keyName, isValid) => testDefenitions.push({ keyName, isValid });

  const invalidKeyNames = [
    'key name',
    'keyname@',
    'keyName',
    '/keyname',
    'key@name/',
    'category/key@_name',
    '@keyName',
    '@category/@keyName',
  ];
  const validKeyNames = [
    'key_name',
    'category/key_name',
    'category/key_name/key_name',
    '@key_name',
    '@category/@keyname',
  ];

  invalidKeyNames.forEach(x => setTestDefenition(x, false));
  validKeyNames.forEach(x => setTestDefenition(x, true));

  it('should check and show key name validation', () => {
    browser.click(keySelectors.ADD_KEY_BUTTON);
    browser.click(keySelectors.KEY_NAME_INPUT);

    testDefenitions.forEach(x => {
      const { keyName, isValid } = x;
      browser.setValue(keySelectors.KEY_NAME_INPUT, keyName);
      browser.waitForVisible(keySelectors.KEY_NAME_VALIDATION_ALERT_ICON, 1000, isValid);
    });

    browser.setValue(keySelectors.KEY_NAME_INPUT, BLANK_KEY_NAME);
    assert(
      browser.isVisible(keySelectors.KEY_NAME_VALIDATION_ALERT_ICON),
      'should show key name validation for blank key name',
    );
  });

  it('should show validaton alert on clicking save without a value', () => {
    browser.click(keySelectors.ADD_KEY_BUTTON);
    KeysAsserts.assertKeyOpened(BLANK_KEY_NAME);

    browser.setValue(keySelectors.KEY_VALUE_TYPE_INPUT, 'String'); // to make local changes

    browser.waitForEnabled(keySelectors.SAVE_CHANGES_BUTTON, 1000);
    browser.click(keySelectors.SAVE_CHANGES_BUTTON);

    assert(!KeyUtils.isSaving(), 'should not enter saving mode');
    assert(
      browser.isVisible(keySelectors.KEY_NAME_VALIDATION_ALERT_ICON),
      'should show key name validation',
    );
  });

  it('should allow creating a key named "a/b/c" and also a key named "b"', () => {
    KeyUtils.addEmptyKey('a/b/c');
    browser.refresh();
    KeyUtils.addEmptyKey('b');
  });
});

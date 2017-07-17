/* global describe, before, after, it, browser */

import KeysAsserts from '../../KeysAsserts';
import KeysPageObject, { BLANK_KEY_NAME } from '../../utils/KeysPageObject';
import { expect, assert } from 'chai';
import keySelectors from '../../selectors/keySelectors';
import globalSelectors from '../../selectors/globalSelectors';

describe('key name validations', () => {
  const keysPageObject = new KeysPageObject(browser);
  const keysAsserts = new KeysAsserts(keysPageObject, browser);

  beforeEach(() => {
    keysPageObject.goToBase();
  });

  const testDefenitions = [];
  const setTestDefenition = (keyName, isValid) => testDefenitions.push({ keyName, isValid });

  const invalidKeyNames =
    ['key name', 'keyname@', 'keyName', '/keyname', 'key@name/', 'category/key@_name', '@keyName', '@category/@keyName'];
  const validKeyNames = ['key_name', 'category/key_name', 'category/key_name/key_name', '@key_name', '@category/@keyname'];

  invalidKeyNames.forEach(x => setTestDefenition(x, false));
  validKeyNames.forEach(x => setTestDefenition(x, true));

  it('should check and show key name validation', () => {
    browser.click(keySelectors.ADD_KEY_BUTTON);
    browser.click(keySelectors.KEY_NAME_INPUT);

    testDefenitions.forEach(x => {
      const {keyName, isValid} = x;
      browser.setValue(keySelectors.KEY_NAME_INPUT, keyName);
      keysPageObject.wait(1000, false);
      expect(browser.isVisible(keySelectors.KEY_NAME_VALIDATION_ALERT_ICON))
        .to.equal(!isValid, `should show key name validation for key name:${keyName}`);
    });

    browser.setValue(keySelectors.KEY_NAME_INPUT, BLANK_KEY_NAME);
    assert(browser.isVisible(keySelectors.KEY_NAME_VALIDATION_ALERT_ICON), 'should show key name validation for blank key name');
  });

  it('should show validaton alert on clicking save without a value', () => {
    browser.click(keySelectors.ADD_KEY_BUTTON);
    keysAsserts.assertKeyOpened(BLANK_KEY_NAME);

    browser.setValue(keySelectors.KEY_VALUE_TYPE_INPUT, 'String'); // to make local changes

    assert(!keysPageObject.isSaveButtonDisabled(), 'should not disable save button');
    browser.click(keySelectors.SAVE_CHANGES_BUTTON);

    assert(!keysPageObject.isSaving(), 'should not enter saving mode');
    assert(browser.isVisible(keySelectors.KEY_NAME_VALIDATION_ALERT_ICON), 'should show key name validation');
  });

  it('should allow creating a key named "a/b/c" and also a key named "b"', ()=>{
    keysPageObject.addEmptyKey("a/b/c");
    browser.refresh();
    keysPageObject.addEmptyKey("b");
  });
});

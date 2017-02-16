/* global describe, before, after it, browser */

import KeysAsserts from '../KeysAsserts';
import KeysPageObject from '../KeysPageObject';
import { expect, assert } from 'chai';
import { selectors } from '../selectors';
import { BLANK_KEY_NAME } from '../../../modules/store/ducks/ducks-utils/blankKeyDefinition';
import Chance from 'chance';

describe('key name validations', () => {
  const chance = new Chance();

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
    browser.click(selectors.ADD_KEY_BUTTON);
    keysAsserts.assertKeyOpened(BLANK_KEY_NAME);

    browser.click(selectors.KEY_NAME_INPUT);

    testDefenitions.forEach(x => {
      const {keyName, isValid} = x;
      browser.setValue(selectors.KEY_NAME_INPUT, keyName);
      keysPageObject.wait(1000, false);
      expect(browser.isVisible(selectors.KEY_NAME_VALIDATION_ALERT_ICON))
        .to.equal(!isValid, `should show key name validation for key name:${keyName}`);
    });

    browser.setValue(selectors.KEY_NAME_INPUT, BLANK_KEY_NAME);
    assert(browser.isVisible(selectors.KEY_NAME_VALIDATION_ALERT_ICON), 'should show key name validation for blank key name');
  });

  it('should show validaton alert on clicking save without a value', () => {
    browser.click(selectors.ADD_KEY_BUTTON);
    keysAsserts.assertKeyOpened(BLANK_KEY_NAME);

    browser.setValue(selectors.KEY_VALUE_TYPE_INPUT, 'String'); // to make local changes
    const firstSuggestion = selectors.typeaheadSuggestionByIndex(0);
    browser.click(firstSuggestion);

    browser.click(selectors.BACKGROUND);

    assert(!keysPageObject.isSaveButtonDisabled(), 'should not disable save button');
    browser.click(selectors.SAVE_CHANGES_BUTTON);

    assert(!keysPageObject.isSaving(), 'should not enter saving mode');
    assert(browser.isVisible(selectors.KEY_NAME_VALIDATION_ALERT_ICON), 'should show key name validation');
  });
});

/* global describe, before, after it, browser */

import KeysAsserts from '../KeysAsserts';
import KeysPageObject from '../KeysPageObject';
import assert from 'assert';
import { selectors } from '../selectors';
import { BLANK_KEY_NAME } from '../../../modules/store/ducks/ducks-utils/blankKeyDefinition';
import Chance from 'chance';

describe('key name validations', () => {
  const chance = new Chance();

  const keysPageObject = new KeysPageObject(browser);
  const keysAsserts = new KeysAsserts(keysPageObject, browser);

  beforeEach(() => {
    browser.url(KeysPageObject.BASE_URL);
    if (keysPageObject.didAlertRaised()) browser.alertAccept();
  });

  it('should show invalid key name and disable save button', () => {
    browser.click(selectors.ADD_KEY_BUTTON);
    keysAsserts.assertKeyOpened(BLANK_KEY_NAME);

    browser.click(selectors.KEY_NAME_INPUT);

    browser.setValue(selectors.KEY_NAME_INPUT, chance.guid());

    assert(!keysPageObject.isSaveButtonDisabled(), 'should not disable save button');
    assert(!browser.isVisible(selectors.KEY_NAME_VALIDATION_ALERT_ICON), 'should not show key name validation');

    browser.setValue(selectors.KEY_NAME_INPUT, BLANK_KEY_NAME);
    assert(browser.isVisible(selectors.KEY_NAME_VALIDATION_ALERT_ICON), 'should show key name validation');
  });

  it('should show validaton alert on clicking save without a value', () => {
    browser.click(selectors.ADD_KEY_BUTTON);
    keysAsserts.assertKeyOpened(BLANK_KEY_NAME);

    browser.setValue(selectors.KEY_VALUE_TYPE_INPUT, 'String'); // to make local changes

    assert(!keysPageObject.isSaveButtonDisabled(), 'should not disable save button');
    browser.click(selectors.SAVE_CHANGES_BUTTON);

    assert(!keysPageObject.isSaving(), 'should not enter saving mode');
    assert(browser.isVisible(selectors.KEY_NAME_VALIDATION_ALERT_ICON), 'should show key name validation');
  });
});

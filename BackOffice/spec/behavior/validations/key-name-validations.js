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

  before(() => {
    browser.url(KeysPageObject.BASE_URL);
  });

  it('should show invalid key name and disable save button', () => {
    browser.click(selectors.ADD_KEY_BUTTON);
    keysAsserts.assertKeyOpened(BLANK_KEY_NAME);

    browser.click(selectors.KEY_NAME_INPUT);

    browser.setValue(selectors.KEY_NAME_INPUT, chance.guid());

    assert(!keysPageObject.isSaveButtonDisabled(), 'should not disable save button');
    assert(!browser.isVisible(selectors.VALIDATION_MESSAGE), 'should show key name validation message');

    browser.setValue(selectors.KEY_NAME_INPUT, BLANK_KEY_NAME);

    assert(keysPageObject.isSaveButtonDisabled(), 'should disable save button');
    assert(browser.isVisible(selectors.VALIDATION_MESSAGE), 'should show key name validation message');
  });
});

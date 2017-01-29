/* global describe, before, after it, browser */

import KeysAsserts from '../KeysAsserts';
import KeysPageObject from '../KeysPageObject';
import assert from 'assert';
import { selectors } from '../selectors';
import { BLANK_KEY_NAME } from '../../../modules/store/ducks/ducks-utils/blankKeyDefinition';

describe('add key', () => {
  const keysPageObject = new KeysPageObject(browser);

  const keyToAdd = keysPageObject.generateTestKeyName('addKeyTest');
  const testFolder = KeysPageObject.TEST_KEYS_FOLDER;
  const addKeyTestFolder = '@addKey';
  const keyToAddFullPath = `${testFolder}/${addKeyTestFolder}/${keyToAdd}`;

  const keysAsserts = new KeysAsserts(keysPageObject, browser);

  before(() => {
    browser.url(KeysPageObject.BASE_URL);
  });

  after(() => {
    keysPageObject.deleteKeyIfExists(keyToAddFullPath);
  });

  it('should succeed adding key', () => {
    browser.click(selectors.ADD_KEY_BUTTON);
    keysAsserts.assertKeyOpened(BLANK_KEY_NAME);

    let isKeyPathSuggestionsExists = browser.isExisting(selectors.KEY_PATH_SUGGESTIONS);
    assert(!isKeyPathSuggestionsExists, 'should not show key name suggestions on start');

    keysAsserts.assertKeyHasNumberOfRules(1);
    keysAsserts.assertKeyHasDefaultValueRule();

    browser.click(selectors.KEY_NAME_INPUT);
    isKeyPathSuggestionsExists = browser.isExisting(selectors.KEY_PATH_SUGGESTIONS);
    assert(isKeyPathSuggestionsExists, 'should show key name suggestions on input focus');

    browser.setValue(selectors.KEY_NAME_INPUT, keyToAddFullPath);
    browser.setValue(selectors.KEY_VALUE_TYPE_INPUT, 'string');

    assert(keysPageObject.hasChanges(), 'should has changes');

    browser.click(selectors.SAVE_CHANGES_BUTTON);
    assert(keysPageObject.isSaving(), 'should be in saving state');

    browser.waitUntil(() =>
      keysPageObject.isInKeyPage(keyToAddFullPath),
      KeysPageObject.GIT_TRANSACTION_TIMEOUT);

    browser.waitForVisible(selectors.DELETE_KEY_BUTTON, 10000);

    assert(browser.getText(selectors.KEY_DISPLAY_NAME),
      keyToAddFullPath,
      'should set the key name correctly');

    browser.waitUntil(() =>
      !keysPageObject.hasChanges(), 4000, 'new key should not be in with-changes state');
  });
});

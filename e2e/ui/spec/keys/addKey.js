/* global describe, before, after, it, browser */

import KeysAsserts from '../../KeysAsserts';
import KeysPage, { BLANK_KEY_NAME } from '../../utils/KeysPage';
import assert from 'assert';
import keySelectors from '../../selectors/keySelectors';
import globalSelectors from '../../selectors/globalSelectors';

describe('add key', () => {
  const keyToAdd = KeysPage.generateTestKeyName('add_key_test');
  const testFolder = KeysPage.TEST_KEYS_FOLDER;
  const addKeyTestFolder = '@add_key';
  const keyToAddFullPath = `${testFolder}/${addKeyTestFolder}/${keyToAdd}`;

  before(() => {
    KeysPage.goToBase();
  });

  it('should succeed adding key', () => {
    browser.click(keySelectors.ADD_KEY_BUTTON);
    KeysAsserts.assertKeyOpened(BLANK_KEY_NAME);
    browser.windowHandleMaximize();

    let isKeyPathSuggestionsExists = browser.isExisting(keySelectors.KEY_PATH_SUGGESTIONS);
    assert(!isKeyPathSuggestionsExists, 'should not show key name suggestions on start');

    KeysAsserts.assertKeyHasNumberOfRules(0);

    browser.click(keySelectors.KEY_NAME_INPUT);
    isKeyPathSuggestionsExists = browser.isExisting(keySelectors.KEY_PATH_SUGGESTIONS);
    assert(isKeyPathSuggestionsExists, 'should show key name suggestions on input focus');

    browser.setValue(keySelectors.KEY_NAME_INPUT, keyToAddFullPath);

    browser.setValue(keySelectors.KEY_VALUE_TYPE_INPUT, 'String');

    assert(KeysPage.hasChanges(), 'should have changes');

    browser.click(keySelectors.SAVE_CHANGES_BUTTON);
    assert(KeysPage.isSaving(), 'should be in saving state');

    browser.waitUntil(() =>
      KeysPage.isInKeyPage(keyToAddFullPath),
      KeysPage.GIT_TRANSACTION_TIMEOUT);

    browser.waitForVisible(keySelectors.ARCHIVE_KEY_BUTTON, KeysPage.GIT_TRANSACTION_TIMEOUT);

    assert(browser.getText(keySelectors.KEY_DISPLAY_NAME),
      keyToAddFullPath,
      'should set the key name correctly');

    browser.waitUntil(() =>
      !KeysPage.hasChanges(), 4000, 'new key should not be in with-changes state');
  });
});

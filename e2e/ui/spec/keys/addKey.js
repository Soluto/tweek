/* global describe, before, after, it, browser */

import KeysAsserts from '../../KeysAsserts';
import * as KeyUtils from '../../utils/KeysPage';
import { BLANK_KEY_NAME } from '../../utils/KeysPage';
import assert from 'assert';
import keySelectors from '../../selectors/keySelectors';

describe('add key', () => {
  const keyToAdd = KeyUtils.generateTestKeyName('add_key_test');
  const addKeyTestFolder = '@add_key';
  const keyToAddFullPath = `@behavior_tests/${addKeyTestFolder}/${keyToAdd}`;

  before(() => {
    KeyUtils.goToKey();
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

    assert(KeyUtils.hasChanges(), 'should have changes');

    browser.click(keySelectors.SAVE_CHANGES_BUTTON);
    assert(KeyUtils.isSaving(), 'should be in saving state');

    browser.waitUntil(
      () => KeyUtils.isInKeyPage(keyToAddFullPath),
      KeyUtils.defaultTimeout
    );

    browser.waitForVisible(keySelectors.ARCHIVE_KEY_BUTTON, KeyUtils.defaultTimeout);

    assert(browser.getText(keySelectors.KEY_DISPLAY_NAME),
      keyToAddFullPath,
      'should set the key name correctly');

    browser.waitUntil(() =>
      !KeyUtils.hasChanges(), 4000, 'new key should not be in with-changes state');
  });
});

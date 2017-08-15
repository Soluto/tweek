/* global describe, before, after, it, browser */

import * as KeysAsserts from '../../utils/key-asserts';
import {
  isInKeyPage,
  saveChangesButton,
  keyNameInput,
  defaultTimeout,
  BLANK_KEY_NAME,
} from '../../utils/key-utils';
import Key from '../../utils/Key';
import { dataComp, dataField } from '../../utils/selector-utils';
import assert from 'assert';

describe('add key', () => {
  const keyToAddFullPath = `behavior_tests/add_key/add_key_test`;
  const newKeyName = field => `${dataComp('new-key-name')} ${dataField(field)}`;
  const keyPathSuggestions = newKeyName('suggestions');

  it('should succeed adding key', () => {
    Key.add();

    KeysAsserts.assertKeyOpened(BLANK_KEY_NAME);

    assert(
      !browser.isExisting(keyPathSuggestions),
      'should not show key name suggestions on start',
    );

    KeysAsserts.assertKeyHasNumberOfRules(0);

    browser.click(keyNameInput);
    assert(
      browser.isExisting(keyPathSuggestions),
      'should show key name suggestions on input focus',
    );

    Key.current.withName(keyToAddFullPath).withValueType('string');

    assert(Key.hasChanges, 'should have changes');

    browser.click(saveChangesButton);
    assert(Key.isSaving, 'should be in saving state');

    browser.waitUntil(() => isInKeyPage(keyToAddFullPath), defaultTimeout);

    browser.waitForVisible(dataComp('archive-key'), defaultTimeout);

    assert.equal(Key.displayName, keyToAddFullPath, 'should set the key name correctly');

    assert.equal(Key.hasChanges, false, 'should not have changes');
  });
});

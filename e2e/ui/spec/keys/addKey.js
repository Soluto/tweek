/* global describe, before, after, it, browser */

import * as KeysAsserts from '../../utils/key-asserts';
import {
  goToKey,
  hasChanges,
  isSaving,
  isInKeyPage,
  defaultTimeout,
  BLANK_KEY_NAME,
} from '../../utils/KeysPage';
import { dataComp, dataField } from '../../utils/selector-utils';
import assert from 'assert';

describe('add key', () => {
  const keyToAddFullPath = `@behavior_tests/@add_key/add_key_test`;
  const newKeyName = field => `${dataComp('new-key-name')} ${dataField(field)}`;
  const keyPathSuggestions = newKeyName('suggestions');
  const keyNameInput = newKeyName('new-key-name-input');

  before(() => {
    goToKey();
  });

  it('should succeed adding key', () => {
    browser.click(dataComp('add-new-key'));

    KeysAsserts.assertKeyOpened(BLANK_KEY_NAME);
    browser.windowHandleMaximize();

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

    browser.setValue(keyNameInput, keyToAddFullPath);

    browser.setValue(dataComp('key-value-type-selector'), 'String');

    assert(hasChanges(), 'should have changes');

    browser.click(dataComp('save-changes'));
    assert(isSaving(), 'should be in saving state');

    browser.waitUntil(() => isInKeyPage(keyToAddFullPath), defaultTimeout);

    browser.waitForVisible(dataComp('archive-key'), defaultTimeout);

    assert(
      browser.getText(`${dataComp('editable-text')} ${dataField('text')}`),
      keyToAddFullPath,
      'should set the key name correctly',
    );

    browser.waitUntil(() => !hasChanges(), 4000, 'new key should not be in with-changes state');
  });
});

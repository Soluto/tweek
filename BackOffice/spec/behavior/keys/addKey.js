/* global describe, before, after it, browser */

import KeysAsserts from './KeysAsserts';
import KeysPageObject from '../KeysPageObject';
import assert from 'assert';
import { selectors } from '../selectors';

describe('add key', () => {
  const keysPageObject = new KeysPageObject(browser);

  const keyToAdd = keysPageObject.generateKeyName('addKeyTest');
  const testFolder = '@tests';
  const behaviorTestFolder = `${testFolder}/behavior`;
  const keyToAddFullPath = `${behaviorTestFolder}/${keyToAdd}`;

  const keysAsserts = new KeysAsserts(keysPageObject, browser);

  before(() => {
    browser.url(KeysPageObject.BASE_URL);
  });

  after(() => {
    keysPageObject.deleteKeyIfExists(keyToAddFullPath);
  });

  it('should succeed adding key', () => {
    const saveKeyTimeout = 10000;

    browser.click(selectors.ADD_KEY_BUTTON);
    keysAsserts.assertKeyOpened('_blank');

    let isKeyPathSuggestionsExists = browser.isExisting(selectors.KEY_PATH_SUGGESTIONS);
    assert(!isKeyPathSuggestionsExists, 'should not show key name suggestions on start');

    keysAsserts.assertKeyHasNumberOfRules(1);
    keysAsserts.assertKeyHasDefaultValueRule();

    browser.click(selectors.KEY_PATH_INPUT);
    isKeyPathSuggestionsExists = browser.isExisting(selectors.KEY_PATH_SUGGESTIONS);
    assert(isKeyPathSuggestionsExists, 'should show key name suggestions focus the input');

    browser.setValue(selectors.KEY_PATH_INPUT, keyToAddFullPath);

    assert(keysPageObject.hasChanges(), 'should has changes');

    browser.click(selectors.SAVE_CHANGES_BUTTON);
    assert(keysPageObject.isSaving(), 'should be in saving state');
    
    browser.waitUntil(() =>
      keysPageObject.isInKeyPage(keyToAddFullPath),
      saveKeyTimeout);

    assert(browser.getText(selectors.EDITABLE_KEY_NAME),
      keyToAddFullPath,
      'should set the key name correctly');

    assert(!keysPageObject.hasChanges(), 'should not has changes');
  });
});

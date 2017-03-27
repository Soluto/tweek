/* global describe, before, after it, browser */

import KeysAsserts from '../KeysAsserts';
import PageAsserts from '../PageAsserts';
import KeysPageObject from '../KeysPageObject';
import assert from 'assert';
import { selectors } from '../selectors';

describe('delete key', () => {
  const keysPageObject = new KeysPageObject(browser);

  const keyToDelete = keysPageObject.generateTestKeyName('delete_key_test');
  const testFolder = KeysPageObject.TEST_KEYS_FOLDER;
  const deleteKeyTestFolder = '@delete_key';
  const keyToDeleteFullPath = `${testFolder}/${deleteKeyTestFolder}/${keyToDelete}`;

  const pageAsserts = new PageAsserts(keysPageObject);
  const keysAsserts = new KeysAsserts(keysPageObject, browser);

  before(() => {
    keysPageObject.goToBase();
    keysPageObject.addEmptyKey(keyToDeleteFullPath);
  });

  it('should succeed deleting key', () => {
    keysPageObject.goToKey(keyToDeleteFullPath);

    browser.click(selectors.DELETE_KEY_BUTTON);
    browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
    keysPageObject.acceptRodalIfRaised();

    pageAsserts.assertIsInPage(KeysPageObject.KEYS_PAGE_URL, 'should moves to keys page url');
    keysAsserts.assertIsKeyExistsAfterTransaction(keyToDeleteFullPath, false, 'key should not exist after delete');
  });
});


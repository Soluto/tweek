/* global describe, before, after it, browser */

import KeysAsserts from './KeysAsserts';
import PageAsserts from '../PageAsserts';
import KeysPageObject from '../KeysPageObject';
import assert from 'assert';
import { selectors } from '../selectors';

describe('delete key', () => {
  const keysPageObject = new KeysPageObject(browser);

  const keyToDelete = keysPageObject.generateTestKeyName('deleteKeyTest');
  const testFolder = '@tests';
  const behaviorTestFolder = `${testFolder}/behavior`;
  const keyToDeleteFullPath = `${behaviorTestFolder}/${keyToDelete}`;

  const pageAsserts = new PageAsserts(keysPageObject);
  const keysAsserts = new KeysAsserts(keysPageObject, browser);

  before(() => {
    browser.url(KeysPageObject.BASE_URL);
    keysPageObject.addEmptyKey(keyToDeleteFullPath);
  });

  it('should succeed deleting key', () => {
    keysPageObject.goToKey(keyToDeleteFullPath);

    keysAsserts.assertKeyOpened(keyToDeleteFullPath);

    browser.click(selectors.DELETE_KEY_BUTTON);
    assert(browser.alertText(), 'should show deleting alert');
    browser.alertAccept();

    pageAsserts.assertIsInPage(KeysPageObject.KEYS_PAGE_URL, 'should moves to keys page url');
    keysAsserts.assertIsKeyExistsAfterTransaction(keyToDeleteFullPath, false, 'key should not exist after delete');
  });
});


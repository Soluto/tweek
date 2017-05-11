/* global describe, before, beforeEach, after, afterEach, it, browser */

import KeysAsserts from '../../KeysAsserts';
import PageAsserts from '../../PageAsserts';
import KeysPageObject from '../../utils/KeysPageObject';
import keySelectors from '../../selectors/keySelectors';
import globalSelectors from '../../selectors/globalSelectors';

describe('delete key', () => {
  const keysPageObject = new KeysPageObject(browser);

  const testFolder = KeysPageObject.TEST_KEYS_FOLDER;
  const deleteKeyTestFolder = '@delete_key';
  let keyToDeleteFullPath;

  const pageAsserts = new PageAsserts(keysPageObject);
  const keysAsserts = new KeysAsserts(keysPageObject, browser);

  beforeEach(() => {
    keysPageObject.goToBase();
    const keyToDelete = keysPageObject.generateTestKeyName('delete_key_test');
    keyToDeleteFullPath = `${testFolder}/${deleteKeyTestFolder}/${keyToDelete}`;
    keysPageObject.addEmptyKey(keyToDeleteFullPath);
  });

  it('should not delete key if alert was not accepted', () => {
    keysPageObject.goToKey(keyToDeleteFullPath);

    browser.click(keySelectors.DELETE_KEY_BUTTON);
    browser.waitForVisible(keySelectors.ALERT_CANCEL_BUTTON, 1000);
    browser.leftClick(globalSelectors.ALERT_BACKGROUND, -200, -200);
    pageAsserts.assertIsInPage(`${KeysPageObject.KEYS_PAGE_URL}/${keyToDeleteFullPath}`, 'should still be in key page');
    keysAsserts.assertIsKeyExistsAfterTransaction(keyToDeleteFullPath, true, 'key should exist after cancel delete');
  });

  it('should not delete key if alert was canceled', () => {
    keysPageObject.goToKey(keyToDeleteFullPath);

    browser.click(keySelectors.DELETE_KEY_BUTTON);
    browser.waitForVisible(keySelectors.ALERT_CANCEL_BUTTON, 1000);
    browser.click(keySelectors.ALERT_CANCEL_BUTTON);
    pageAsserts.assertIsInPage(`${KeysPageObject.KEYS_PAGE_URL}/${keyToDeleteFullPath}`, 'should still be in key page');
    keysAsserts.assertIsKeyExistsAfterTransaction(keyToDeleteFullPath, true, 'key should exist after cancel delete');
  });

  it('should succeed deleting key', () => {
    keysPageObject.goToKey(keyToDeleteFullPath);

    browser.click(keySelectors.DELETE_KEY_BUTTON);
    browser.waitForVisible(keySelectors.ALERT_CANCEL_BUTTON, 1000);
    keysPageObject.acceptRodalIfRaised();

    pageAsserts.assertIsInPage(KeysPageObject.KEYS_PAGE_URL, 'should moves to keys page url');
    keysAsserts.assertIsKeyExistsAfterTransaction(keyToDeleteFullPath, false, 'key should not exist after delete');
  });
});


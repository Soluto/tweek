/* global describe, before, beforeEach, after, afterEach, it, browser */

import chai, { expect } from 'chai';
import chaiString from 'chai-string';
import KeysAsserts from '../../KeysAsserts';
import PageAsserts from '../../PageAsserts';
import KeysPage from '../../utils/KeysPage';
import keySelectors from '../../selectors/keySelectors';
import globalSelectors from '../../selectors/globalSelectors';

chai.use(chaiString);

describe('delete key', () => {
  const testFolder = KeysPage.TEST_KEYS_FOLDER;
  const deleteKeyTestFolder = '@delete_key';
  let keyToDeleteFullPath;

  beforeEach(() => {
    KeysPage.goToBase();
    const keyToDelete = KeysPage.generateTestKeyName('delete_key_test');
    keyToDeleteFullPath = `${testFolder}/${deleteKeyTestFolder}/${keyToDelete}`;
    KeysPage.addEmptyKey(keyToDeleteFullPath);
    KeysPage.goToKey(keyToDeleteFullPath);
  });

  describe('archive', () => {
    it('should archive key', () => {
      KeysPage.commitChanges(keySelectors.ARCHIVE_KEY_BUTTON);

      expect(browser.isVisible(keySelectors.READONLY_KEY_MESSAGE), 'should show key is readonly message').to.be.true;
      const displayText = browser.getText(keySelectors.KEY_DISPLAY_NAME);
      expect(displayText).to.startsWith('ARCHIVED: ');
      expect(browser.isVisible(keySelectors.ARCHIVE_KEY_BUTTON), 'should not show archive key button').to.be.false;
      expect(browser.isVisible(keySelectors.DELETE_KEY_BUTTON), 'should show delete key button').to.be.true;
      expect(browser.isVisible(keySelectors.UNARCHIVE_KEY_BUTTON), 'should show unarchive key button').to.be.true;
    });
  });

  describe('unarchive', () => {
    beforeEach(() => {
      KeysPage.commitChanges(keySelectors.ARCHIVE_KEY_BUTTON);
    });

    it('should unarchive key', () => {
      KeysPage.commitChanges(keySelectors.UNARCHIVE_KEY_BUTTON);

      expect(browser.isVisible(keySelectors.READONLY_KEY_MESSAGE), 'should not show key is readonly message').to.be.false;
      const displayText = browser.getText(keySelectors.KEY_DISPLAY_NAME);
      expect(displayText).to.not.startsWith('ARCHIVED: ');

      expect(browser.isVisible(keySelectors.ARCHIVE_KEY_BUTTON), 'should show archive key button').to.be.true;
      expect(browser.isVisible(keySelectors.DELETE_KEY_BUTTON), 'should not show delete key button').to.be.false;
      expect(browser.isVisible(keySelectors.UNARCHIVE_KEY_BUTTON), 'should not show unarchive key button').to.be.false;
    })
  });

  describe('delete', () => {
    beforeEach(() => {
      KeysPage.commitChanges(keySelectors.ARCHIVE_KEY_BUTTON);
    });

    it('should not delete key if alert was not accepted', () => {
      browser.click(keySelectors.DELETE_KEY_BUTTON);
      browser.waitForVisible(keySelectors.ALERT_CANCEL_BUTTON, 1000);
      browser.leftClick(globalSelectors.ALERT_BACKGROUND, -200, -200);

      PageAsserts.assertIsInPage(`${KeysPage.KEYS_PAGE_URL}/${keyToDeleteFullPath}`, 'should still be in key page');
      KeysAsserts.assertIsKeyExistsAfterTransaction(keyToDeleteFullPath, true, 'key should exist after cancel delete');
    });

    it('should not delete key if alert was canceled', () => {
      browser.click(keySelectors.DELETE_KEY_BUTTON);
      browser.waitForVisible(keySelectors.ALERT_CANCEL_BUTTON, 1000);
      browser.click(keySelectors.ALERT_CANCEL_BUTTON);

      PageAsserts.assertIsInPage(`${KeysPage.KEYS_PAGE_URL}/${keyToDeleteFullPath}`, 'should still be in key page');
      KeysAsserts.assertIsKeyExistsAfterTransaction(keyToDeleteFullPath, true, 'key should exist after cancel delete');
    });

    it('should succeed deleting key', () => {
      browser.click(keySelectors.DELETE_KEY_BUTTON);
      browser.waitForVisible(keySelectors.ALERT_CANCEL_BUTTON, 1000);
      KeysPage.acceptRodalIfRaised();

      PageAsserts.assertIsInPage(KeysPage.KEYS_PAGE_URL, 'should moves to keys page url');
      KeysAsserts.assertIsKeyExistsAfterTransaction(keyToDeleteFullPath, false, 'key should not exist after delete');
    });
  });
});


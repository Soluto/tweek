/* global describe, before, beforeEach, after, afterEach, it, browser */

import chai, { expect } from 'chai';
import chaiString from 'chai-string';
import KeysAsserts from '../../utils/key-asserts';
import PageAsserts from '../../utils/page-asserts';
import * as KeyUtils from '../../utils/KeysPage';
import { alertButton } from '../../utils/selector-utils';
import keySelectors from '../../selectors/keySelectors';
import globalSelectors from '../../selectors/globalSelectors';

chai.use(chaiString);

describe('delete key', () => {
  const deleteKeyTestFolder = '@delete_key';
  let keyToDeleteFullPath;

  beforeEach(() => {
    const keyToDelete = KeyUtils.generateTestKeyName('delete_key_test');
    keyToDeleteFullPath = `@behavior_tests/${deleteKeyTestFolder}/${keyToDelete}`;
    KeyUtils.addEmptyKey(keyToDeleteFullPath);
  });

  describe('archive', () => {
    it('should archive key', () => {
      KeyUtils.commitChanges(keySelectors.ARCHIVE_KEY_BUTTON);

      expect(
        browser.isVisible(keySelectors.READONLY_KEY_MESSAGE),
        'should show key is readonly message',
      ).to.be.true;
      const displayText = browser.getText(keySelectors.KEY_DISPLAY_NAME);
      expect(displayText).to.startsWith('ARCHIVED: ');
      expect(
        browser.isVisible(keySelectors.ARCHIVE_KEY_BUTTON),
        'should not show archive key button',
      ).to.be.false;
      expect(browser.isVisible(keySelectors.DELETE_KEY_BUTTON), 'should show delete key button').to
        .be.true;
      expect(
        browser.isVisible(keySelectors.UNARCHIVE_KEY_BUTTON),
        'should show unarchive key button',
      ).to.be.true;
    });
  });

  describe('unarchive', () => {
    beforeEach(() => {
      KeyUtils.commitChanges(keySelectors.ARCHIVE_KEY_BUTTON);
    });

    it('should unarchive key', () => {
      KeyUtils.commitChanges(keySelectors.UNARCHIVE_KEY_BUTTON);

      expect(
        browser.isVisible(keySelectors.READONLY_KEY_MESSAGE),
        'should not show key is readonly message',
      ).to.be.false;
      const displayText = browser.getText(keySelectors.KEY_DISPLAY_NAME);
      expect(displayText).to.not.startsWith('ARCHIVED: ');

      expect(browser.isVisible(keySelectors.ARCHIVE_KEY_BUTTON), 'should show archive key button')
        .to.be.true;
      expect(browser.isVisible(keySelectors.DELETE_KEY_BUTTON), 'should not show delete key button')
        .to.be.false;
      expect(
        browser.isVisible(keySelectors.UNARCHIVE_KEY_BUTTON),
        'should not show unarchive key button',
      ).to.be.false;
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      KeyUtils.commitChanges(keySelectors.ARCHIVE_KEY_BUTTON);
    });

    it('should not delete key if alert was not accepted', () => {
      browser.click(keySelectors.DELETE_KEY_BUTTON);
      browser.waitForVisible(keySelectors.ALERT_CANCEL_BUTTON, 1000);
      browser.leftClick(globalSelectors.ALERT_BACKGROUND, -200, -200);

      KeysAsserts.assertIsInKeyPage(keyToDeleteFullPath, 'should still be in key page');
      KeysAsserts.assertIsKeyExistsAfterTransaction(
        keyToDeleteFullPath,
        true,
        'key should exist after cancel delete',
      );
    });

    it('should not delete key if alert was canceled', () => {
      browser.click(keySelectors.DELETE_KEY_BUTTON);
      browser.waitForVisible(keySelectors.ALERT_CANCEL_BUTTON, 1000);
      browser.click(keySelectors.ALERT_CANCEL_BUTTON);

      KeysAsserts.assertIsInKeyPage(keyToDeleteFullPath, 'should still be in key page');
      KeysAsserts.assertIsKeyExistsAfterTransaction(
        keyToDeleteFullPath,
        true,
        'key should exist after cancel delete',
      );
    });

    it('should succeed deleting key', () => {
      browser.click(keySelectors.DELETE_KEY_BUTTON);
      browser.clickWhenVisible(alertButton('ok'), 1000);

      PageAsserts.assertIsInPage('keys', 'should moves to keys page url');
      KeysAsserts.assertIsKeyExistsAfterTransaction(
        keyToDeleteFullPath,
        false,
        'key should not exist after delete',
      );
    });
  });
});

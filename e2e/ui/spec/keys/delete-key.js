/* global describe, before, beforeEach, after, afterEach, it, browser */

import { expect } from 'chai';
import * as KeysAsserts from '../../utils/key-asserts';
import { assertIsInPage } from '../../utils/page-asserts';
import { goToKey, commitChanges, displayName, defaultTimeout } from '../../utils/key-utils';
import { dataComp, alertButton } from '../../utils/selector-utils';
import globalSelectors from '../../selectors/globalSelectors';

describe('delete key', () => {
  const archiveKey = dataComp('archive-key');
  const unarchiveKey = dataComp('unarchive-key');
  const deleteKey = dataComp('delete-key');
  const keyMessage = dataComp('key-message');

  describe('archive', () => {
    it('should archive key', () => {
      goToKey('behavior_tests/delete_key/archive');
      commitChanges(archiveKey);

      browser.waitForVisible(keyMessage, defaultTimeout);
      const displayText = browser.getText(displayName);
      expect(displayText).to.startsWith('ARCHIVED: ');

      browser.waitForVisible(archiveKey, defaultTimeout, true);
      browser.waitForVisible(unarchiveKey, defaultTimeout);
      browser.waitForVisible(deleteKey, defaultTimeout);
    });
  });

  describe('unarchive', () => {
    it('should unarchive key', () => {
      const keyName = 'behavior_tests/delete_key/unarchive';
      goToKey(keyName);

      commitChanges(unarchiveKey);

      browser.waitForVisible(keyMessage, defaultTimeout, true);

      const displayText = browser.getText(displayName);
      expect(displayText).to.equal(keyName);

      browser.waitForVisible(archiveKey, defaultTimeout);
      browser.waitForVisible(unarchiveKey, defaultTimeout, true);
      browser.waitForVisible(deleteKey, defaultTimeout, true);
    });
  });

  describe('delete', () => {
    it('should not delete key if alert was not accepted', () => {
      const keyName = 'behavior_tests/delete_key/delete/not_accepted';
      goToKey(keyName);
      browser.click(deleteKey);

      browser.waitForVisible(alertButton('cancel'), defaultTimeout);
      browser.leftClick(globalSelectors.ALERT_BACKGROUND, -200, -200);

      KeysAsserts.assertIsInKeyPage(keyName, 'should still be in key page');
      KeysAsserts.assertIsKeyExistsAfterTransaction(
        keyName,
        true,
        'key should exist after cancel delete',
      );
    });

    it('should not delete key if alert was canceled', () => {
      const keyName = 'behavior_tests/delete_key/delete/canceled';
      goToKey(keyName);
      browser.click(deleteKey);

      browser.clickWhenVisible(alertButton('cancel'), defaultTimeout);

      KeysAsserts.assertIsInKeyPage(keyName, 'should still be in key page');
      KeysAsserts.assertIsKeyExistsAfterTransaction(
        keyName,
        true,
        'key should exist after cancel delete',
      );
    });

    it('should succeed deleting key', () => {
      const keyName = 'behavior_tests/delete_key/delete/accepted';
      goToKey(keyName);
      browser.click(deleteKey);

      browser.clickWhenVisible(alertButton('ok'), defaultTimeout);

      assertIsInPage('keys', 'should moves to keys page url');
      KeysAsserts.assertIsKeyExistsAfterTransaction(
        keyName,
        false,
        'key should not exist after delete',
      );
    });
  });
});

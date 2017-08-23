/* global describe, before, beforeEach, after, afterEach, it, browser */

import { expect } from 'chai';
import Key from '../../utils/Key';
import Alert from '../../utils/Alert';
import { dataComp } from '../../utils/selector-utils';
import authoringClient from '../../clients/authoring-client';

const timeout = 5000;

const archiveKey = dataComp('archive-key');
const unarchiveKey = dataComp('unarchive-key');
const deleteKey = dataComp('delete-key');
const keyMessage = dataComp('key-message');

function assertKeyDeleted(keyName) {
  authoringClient.waitForKeyToBeDeleted(keyName);

  Key.open(keyName, false);

  expect(Key.exists, 'key should not exist after delete').to.equal(false);
}

describe('delete key', () => {
  describe('archive', () => {
    it('should archive key', () => {
      const keyName = 'behavior_tests/delete_key/archive';
      Key.open(keyName).commitChanges(archiveKey);

      browser.waitForVisible(keyMessage, timeout);
      expect(Key.displayName).to.equal(`ARCHIVED: ${keyName}`);

      browser.waitForVisible(archiveKey, timeout, true);
      browser.waitForVisible(unarchiveKey, timeout);
      browser.waitForVisible(deleteKey, timeout);
    });
  });

  describe('unarchive', () => {
    it('should unarchive key', () => {
      const keyName = 'behavior_tests/delete_key/unarchive';
      Key.open(keyName).commitChanges(unarchiveKey);

      browser.waitForVisible(keyMessage, timeout, true);

      expect(Key.displayName).to.equal(keyName);

      browser.waitForVisible(archiveKey, timeout);
      browser.waitForVisible(unarchiveKey, timeout, true);
      browser.waitForVisible(deleteKey, timeout, true);
    });
  });

  describe('delete', () => {
    it('should not delete key if alert was not accepted', () => {
      const keyName = 'behavior_tests/delete_key/delete/not_accepted';

      Key.open(keyName);
      browser.click(deleteKey);
      Alert.background();

      expect(Key.isCurrent(keyName), 'should still be in key page').to.be.true;

      Key.open(keyName);

      expect(Key.exists).to.be.true;
    });

    it('should not delete key if alert was canceled', () => {
      const keyName = 'behavior_tests/delete_key/delete/canceled';

      Key.open(keyName);
      browser.click(deleteKey);
      Alert.cancel();

      expect(Key.isCurrent(keyName), 'should still be in key page').to.be.true;

      Key.open(keyName);

      expect(Key.exists).to.be.true;
    });

    it.only('should succeed deleting key', () => {
      const keyName = 'behavior_tests/delete_key/delete/accepted';

      Key.open(keyName);
      browser.click(deleteKey);

      Alert.ok();

      expect(browser.getUrl(), 'should move to keys page url').to.endWith('/keys');

      assertKeyDeleted(keyName);
    });
  });
});

/* global describe, before, after, beforeEach, it, browser */

import Key from '../../utils/Key';
import Rule from '../../utils/Rule';

describe('navigating from key with changes', () => {
  const testKey1 = `test_key1`;
  const folderPath = `@routing`;

  const testKey1FullPath = `@behavior_tests/${folderPath}/${testKey1}`;

  beforeEach(() => Key.add());

  it('should show confirm message if navigating to another key', () => {
    Rule.add();
    browser.waitUntil(() => Key.hasChanges, 2000);

    Key.navigate(testKey1FullPath);

    browser.waitForAlert(1000, 'should show confirm message');
    browser.alertAccept();
  });

  it('should show confirm message if refreshing', () => {
    Rule.add();
    browser.waitUntil(() => Key.hasChanges, 2000);

    browser.refresh();

    browser.waitForAlert(1000, 'should show confirm message');
    browser.alertAccept();
  });
});

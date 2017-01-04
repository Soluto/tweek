/* global describe, before, after it, browser */

import KeysPageObject from '../KeysPageObject';
import assert from 'assert';
import { selectors } from '../selectors';
import PageAsserts from '../PageAsserts';

describe('switch key', () => {
  const keysPageObject = new KeysPageObject(browser);
  const pageAsserts = new PageAsserts(keysPageObject);

  const testFolder = KeysPageObject.TEST_KEYS_FOLDER;
  const testKey1 = `testKey1`;
  const testKey2 = `testKey2`;
  const folderPath = `@routing`;

  const testKey1FullPath = `${testFolder}/${folderPath}/${testKey1}`;
  const testKey2FullPath = `${testFolder}/${folderPath}/${testKey2}`;

  const tests = [];
  const _setupTest = (testName, pageChangeTrigger) => {
    tests.push({ testName, pageChangeTrigger });
  };

  _setupTest('navigate to testKey2', () => keysPageObject.navigateToKey(testKey2FullPath));
  _setupTest('navigate to testKey1', () => keysPageObject.clickOnKeyLink(testKey1FullPath));
  _setupTest('browser refresh', () => browser.refresh());

  const makeKeyChanges = () => {
    browser.click(selectors.ADD_RULE_BUTTON);
    browser.waitUntil(() => keysPageObject.hasChanges(), 2000);
  };

  it('should show confirm message only if there are key changes', () => {
    browser.windowHandleMaximize();

    keysPageObject.goToKey(testKey1FullPath);

    tests.forEach(({ testName, pageChangeTrigger }) => {
      browser.waitForVisible(selectors.KEY_DISPLAY_NAME, 5000);

      makeKeyChanges();
      pageChangeTrigger();

      keysPageObject.wait(2000, false);
      const didAlertRaised = keysPageObject.didAlertRaised();
      assert(didAlertRaised, 'should show confirm message on ' + testName);

      browser.alertAccept();
    });
  });
});

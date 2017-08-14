import assert from 'assert';
import { expect } from 'chai';
import * as KeyUtils from './key-utils';
import { assertIsInPage } from './page-asserts';
import { dataComp } from './selector-utils';

const keyEditPage = dataComp('key-edit-page');

export function assertIsInKeyPage(expectedKey, message) {
  assertIsInPage(`keys/${expectedKey}`, message);
}

export function assertKeyOpened(keyName, timeout = KeyUtils.defaultTimeout) {
  assertIsInKeyPage(keyName, `should be in ${keyName} key page`);
  browser.waitForVisible(keyEditPage, timeout);
  assert.equal(KeyUtils.hasChanges(), false, 'should not have changes');
  assert.equal(KeyUtils.isSaving(), false, 'should not be in saving state');
}

export function assertKeySource(expectedSourceObject) {
  let keySourceObject;
  try {
    keySourceObject = KeyUtils.getKeySource();
  } catch (exp) {
    assert.fail('failed read key source, ' + exp);
  }

  assert.deepEqual(keySourceObject, expectedSourceObject);
}

export function assertKeyHasNumberOfRules(
  expectedNumberOfRules,
  message = 'should have correct ammount of rules',
) {
  assert.equal(KeyUtils.getNumberOfRules(), expectedNumberOfRules, message);
}

export function assertIsKeyExistsAfterTransaction(keyName, isExisting, message) {
  //todo use authoring
  if (!isExisting) KeyUtils.waitForKeyToBeDeleted(keyName);

  KeyUtils.goToKey(keyName, 1000, false);
  assert.equal(browser.isExisting(keyEditPage), isExisting, message);
}

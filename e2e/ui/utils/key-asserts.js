import assert from 'assert';
import { expect } from 'chai';
import * as KeyUtils from './key-utils';
import { assertIsInPage } from './page-asserts';
import { dataComp } from './selector-utils';
import Key from './Key';
import Rule from './Rule';

const keyEditPage = dataComp('key-edit-page');

export function assertIsInKeyPage(expectedKey, message) {
  assertIsInPage(`keys/${expectedKey}`, message);
}

export function assertKeyOpened(keyName, timeout = KeyUtils.defaultTimeout) {
  assertIsInKeyPage(keyName, `should be in ${keyName} key page`);
  browser.waitForVisible(keyEditPage, timeout);
  assert.equal(Key.hasChanges, false, 'should not have changes');
  assert.equal(Key.isSaving, false, 'should not be in saving state');
}

export function assertKeySource(expectedSourceObject) {
  let keySourceObject;
  try {
    keySourceObject = Key.source;
  } catch (exp) {
    assert.fail('failed read key source, ' + exp);
  }

  assert.deepEqual(keySourceObject, expectedSourceObject);
}

export function assertKeyHasNumberOfRules(
  expectedNumberOfRules,
  message = 'should have correct ammount of rules',
) {
  assert.equal(Rule.count(), expectedNumberOfRules, message);
}

export function assertIsKeyExistsAfterTransaction(keyName, isExisting, message) {
  //todo use authoring
  if (!isExisting) KeyUtils.waitForKeyToBeDeleted(keyName);

  Key.open(keyName, false);
  assert.equal(browser.isExisting(keyEditPage), isExisting, message);
}

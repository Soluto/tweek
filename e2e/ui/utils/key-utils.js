/* global browser */

import assert from 'assert';
import { dataComp, dataField, alertButton, attributeSelector } from './selector-utils';
import Key from './Key';

export const saveChangesButton = dataComp('save-changes');

export const rulesEditor = dataComp('key-rules-editor');
const tabHeader = attributeSelector('data-tab-header');
export const sourceTab = `${rulesEditor} ${tabHeader('source')}`;
export const rulesTab = `${rulesEditor} ${tabHeader('rules')}`;

export const keyNameInput = dataField('new-key-name-input');

export const defaultTimeout = 5000;

export const BLANK_KEY_NAME = '_blank';

export function isInKeyPage(keyName) {
  const location = browser.getUrl();
  return location.endsWith(`keys/${keyName}`);
}

export function addEmptyKey(keyName, keyValueType = 'String', timeout = defaultTimeout) {
  Key.add().withName(keyName).withValueType(keyValueType);

  browser.click(saveChangesButton);
  browser.waitUntil(() => isInKeyPage(keyName), timeout);

  assert.equal(Key.displayName, keyName);
}

export function waitForKeyToBeDeleted(keyName, timeout = defaultTimeout) {
  const notFoundMessage = dataComp('key-not-found');
  browser.waitUntil(
    () => {
      Key.open(keyName, false);
      return browser.isExisting(notFoundMessage);
    },
    timeout,
    `key still not deleted after ${timeout}ms`,
  );
}

export function acceptRodalIfRaised() {
  browser.clickIfVisible(alertButton('ok'), 500);
}

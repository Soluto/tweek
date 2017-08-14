/* global browser */

import assert from 'assert';
import moment from 'moment';
import R from 'ramda';
import { dataComp, dataField, alertButton, attributeSelector } from './selector-utils';

export const keyEditPage = dataComp('key-edit-page');
export const saveChangesButton = dataComp('save-changes');
export const displayName = `${dataComp('display-name')} ${dataField('text')}`;

export const rulesEditor = dataComp('key-rules-editor');
const tabHeader = attributeSelector('data-tab-header');
export const sourceTab = `${rulesEditor} ${tabHeader('source')}`;
export const rulesTab = `${rulesEditor} ${tabHeader('rules')}`;

export const keyNameInput = dataField('new-key-name-input');
export const keyValueTypeSelector = dataComp('key-value-type-selector');

export const defaultTimeout = 5000;

export const BLANK_KEY_NAME = '_blank';

export function goToKey(keyName = '', timeout = defaultTimeout, waitToLoad = true) {
  browser.url(`/keys/${keyName}`);
  browser.acceptAlertIfPresent();
  browser.waitForVisible(dataComp('key-page'), timeout);
  browser.waitForVisible(dataComp('search-key-input'), timeout);
  if (keyName !== '' && waitToLoad) {
    waitForKeyToLoad(timeout);
  }
}

export function navigateToKey(keyFullPath, timeout = defaultTimeout) {
  const directoryTreeView = dataComp('directory-tree-view');
  const treeItem = (attribute, value) =>
    `${directoryTreeView} ${attributeSelector(attribute, value)}`;
  const extractFolders = R.pipe(
    R.split('/'),
    R.dropLast(1),
    R.mapAccum((acc, value) => R.repeat(acc ? `${acc}/${value}` : value, 2), null),
    R.prop(1),
  );

  const keyFolders = extractFolders(keyFullPath);

  keyFolders.forEach(
    folder => browser.clickWhenVisible(treeItem('data-folder-name', folder)),
    timeout,
  );

  const keyLinkSelector = treeItem('href', `/keys/${keyFullPath}`);
  browser.clickWhenVisible(keyLinkSelector, timeout);
}

export function isInKeyPage(keyName) {
  const location = browser.getUrl();
  return location.endsWith(`keys/${keyName}`);
}

export function addEmptyKey(keyName, keyValueType = 'String', timeout = defaultTimeout) {
  goToKey();
  browser.click(dataComp('add-new-key'));

  browser.waitForVisible(keyNameInput, timeout);
  browser.setValue(keyNameInput, keyName);
  browser.setValue(keyValueTypeSelector, keyValueType);

  browser.click(saveChangesButton);
  browser.waitUntil(() => isInKeyPage(keyName), timeout);

  browser.waitForText(displayName, timeout);
  assert.equal(browser.getText(displayName), keyName);
}

export function searchKey(filter, timeout = defaultTimeout) {
  const searchKeyInput = dataComp('search-key-input');

  browser.waitForVisible(searchKeyInput, timeout);
  browser.setValue(searchKeyInput, filter);
}

export function waitForKeyToLoad(timeout = defaultTimeout) {
  browser.waitForVisible(keyEditPage, timeout);
}

export function isSaving() {
  return browser.getAttribute(saveChangesButton, 'data-state-is-saving') === 'true';
}

export function hasChanges() {
  return browser.getAttribute(saveChangesButton, 'data-state-has-changes') === 'true';
}

export function commitChanges(selector = saveChangesButton, timeout = defaultTimeout) {
  browser.click(selector);
  browser.waitUntil(() => !hasChanges() && !isSaving(), timeout, 'changes were not saved');
}

export function waitForKeyToBeDeleted(keyName, timeout = defaultTimeout) {
  const notFoundMessage = dataComp('key-not-found');
  browser.waitUntil(
    () => {
      goToKey(keyName, timeout, false);
      return browser.isExisting(notFoundMessage);
    },
    timeout,
    `key still not deleted after ${timeout}ms`,
  );
}

export function getKeySource(timeout = defaultTimeout) {
  browser.waitForVisible(rulesEditor, timeout);

  browser.click(sourceTab);
  browser.waitForVisible('.monaco-editor', 10000);
  const keySourceCode = browser.execute(function() {
    return window.monaco.editor.getModels()[0].getValue();
  });

  browser.click(rulesTab);
  return JSON.parse(keySourceCode.value);
}

export function setKeySource(source, timeout = 10000) {
  browser.waitForVisible('.monaco-editor', timeout);
  browser.execute(function(source) {
    window.monaco.editor.getModels()[0].setValue(source);
  }, source);
}

export function acceptRodalIfRaised() {
  browser.clickIfVisible(alertButton('ok'), 500);
}

import R from 'ramda';
import { dataComp, dataField, attributeSelector } from './selector-utils';

const timeout = 5000;

const keyEditPage = dataComp('key-edit-page');
const keyNameInput = dataField('new-key-name-input');
const keyValueTypeSelector = dataComp('key-value-type-selector');
const saveChangesButton = dataComp('save-changes');
const displayName = `${dataComp('display-name')} ${dataField('text')}`;
const rulesEditor = dataComp('key-rules-editor');
const tabHeader = attributeSelector('data-tab-header');
const sourceTab = `${rulesEditor} ${tabHeader('source')}`;
const rulesTab = `${rulesEditor} ${tabHeader('rules')}`;
const searchKeyInput = dataComp('search-key-input');
const directoryTreeView = dataComp('directory-tree-view');
const treeItem = (attribute, value) =>
  `${directoryTreeView} ${attributeSelector(attribute, value)}`;

const extractFolders = R.pipe(
  R.split('/'),
  R.dropLast(1),
  R.mapAccum((acc, value) => R.repeat(acc ? `${acc}/${value}` : value, 2), null),
  R.prop(1),
);

export default class Key {
  static open(keyName = '', waitToLoad = true) {
    browser.url(`/keys/${keyName}`);
    browser.acceptAlertIfPresent();
    browser.waitForVisible(dataComp('key-page'), timeout);
    browser.waitForVisible(searchKeyInput, timeout);

    if (keyName !== '' && waitToLoad) {
      return new Key().waitToLoad();
    }

    return new Key();
  }

  static navigate(keyName) {
    const keyFolders = extractFolders(keyName);

    keyFolders.forEach(
      folder => browser.clickWhenVisible(treeItem('data-folder-name', folder)),
      timeout,
    );

    const keyLinkSelector = treeItem('href', `/keys/${keyName}`);
    browser.clickWhenVisible(keyLinkSelector, timeout);
  }

  static add() {
    const key = Key.open();
    browser.click(dataComp('add-new-key'));
    return key.waitToLoad();
  }

  static search(filter) {
    browser.waitForVisible(searchKeyInput, timeout);
    browser.setValue(searchKeyInput, filter);
  }

  static get current() {
    return new Key();
  }

  static get hasChanges() {
    return browser.getAttribute(saveChangesButton, 'data-state-has-changes') === 'true';
  }

  static get isSaving() {
    return browser.getAttribute(saveChangesButton, 'data-state-is-saving') === 'true';
  }

  static get displayName() {
    browser.waitForText(displayName);
    return browser.getText(displayName);
  }

  static get source() {
    browser.waitForVisible(rulesEditor, timeout);

    browser.click(sourceTab);
    browser.waitForVisible('.monaco-editor', 10000);
    const keySourceCode = browser.execute(function() {
      return window.monaco.editor.getModels()[0].getValue();
    });

    browser.click(rulesTab);
    return JSON.parse(keySourceCode.value);
  }

  static set source(value) {
    browser.waitForVisible('.monaco-editor', 10000);
    browser.execute(function(source) {
      window.monaco.editor.getModels()[0].setValue(source);
    }, value);
  }

  waitToLoad() {
    browser.waitForVisible(keyEditPage, timeout);
    return this;
  }

  withName(keyName) {
    browser.waitForVisible(keyNameInput, timeout);
    browser.setValue(keyNameInput, keyName);
    return this;
  }

  withValueType(valueType) {
    browser.waitForVisible(keyValueTypeSelector, timeout);
    browser.setValue(keyValueTypeSelector, valueType);
    return this;
  }

  withDefaultValue(defaultValue) {
    browser.setValue(dataComp('default-value'), defaultValue);
    return this;
  }

  commitChanges(selector = saveChangesButton) {
    browser.click(selector);
    browser.waitUntil(() => !Key.hasChanges && !Key.isSaving, timeout, 'changes were not saved');
    return this;
  }
}

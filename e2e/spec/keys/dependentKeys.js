/* global describe, before, beforeEach, after, afterEach, it, browser */

import KeysPage from '../../utils/KeysPage';
import keySelectors from '../../selectors/keySelectors';
import globalSelectors from '../../selectors/globalSelectors';
import { expect } from 'chai';

describe('dependent keys', () => {
  const testFolder = KeysPage.TEST_KEYS_FOLDER;
  const dependentKeysFolder = '@dependent_keys';
  const conditionPropertyInputSelector = keySelectors.conditionPropertyName(1, 1);

  before(() => {
    KeysPage.goToBase();
    browser.windowHandleMaximize();
  });

  it('should save when no circular dependencies', () => {
    const keyWithoutDependency = KeysPage.generateTestKeyName('key1');
    const keyWithoutDependencyFullPath = `${testFolder}/${dependentKeysFolder}/${keyWithoutDependency}`;
    KeysPage.addEmptyKey(keyWithoutDependencyFullPath);

    const keyWithDependency = KeysPage.generateTestKeyName('key2');
    const keyWithDependencyFullPath = `${testFolder}/${dependentKeysFolder}/${keyWithDependency}`;
    KeysPage.addEmptyKey(keyWithDependencyFullPath);

    browser.click(keySelectors.ADD_RULE_BUTTON);

    browser.setValue(conditionPropertyInputSelector, `keys.${keyWithoutDependencyFullPath}`);
    KeysPage.setConditionValue(1, 1, 'value');

    KeysPage.commitChanges();
  });

  it('should not save circular dependencies', () => {
    const keyWithDependency1 = KeysPage.generateTestKeyName('key1');
    const keyWithDependencyFullPath1 = `${testFolder}/${dependentKeysFolder}/${keyWithDependency1}`;
    const keyWithDependency2 = KeysPage.generateTestKeyName('key2');
    const keyWithDependencyFullPath2 = `${testFolder}/${dependentKeysFolder}/${keyWithDependency2}`;
    const keyWithDependency3 = KeysPage.generateTestKeyName('key3');
    const keyWithDependencyFullPath3 = `${testFolder}/${dependentKeysFolder}/${keyWithDependency3}`;

    KeysPage.addEmptyKey(keyWithDependencyFullPath1);
    browser.click(keySelectors.ADD_RULE_BUTTON);
    browser.setValue(conditionPropertyInputSelector, `keys.${keyWithDependencyFullPath3}`);
    KeysPage.setConditionValue(1, 1, 'value');
    KeysPage.commitChanges();

    KeysPage.addEmptyKey(keyWithDependencyFullPath2);
    browser.click(keySelectors.ADD_RULE_BUTTON);
    browser.setValue(conditionPropertyInputSelector, `keys.${keyWithDependencyFullPath1}`);
    KeysPage.setConditionValue(1, 1, 'value');
    KeysPage.commitChanges();

    KeysPage.addEmptyKey(keyWithDependencyFullPath3);
    browser.click(keySelectors.ADD_RULE_BUTTON);
    browser.setValue(conditionPropertyInputSelector, `keys.${keyWithDependencyFullPath2}`);
    KeysPage.setConditionValue(1, 1, 'value');
    browser.click(keySelectors.SAVE_CHANGES_BUTTON);

    browser.waitForVisible(globalSelectors.ERROR_NOTIFICATION_TITLE, KeysPage.GIT_TRANSACTION_TIMEOUT);
    const errorText = browser.getText(globalSelectors.ERROR_NOTIFICATION_TITLE);
    expect(errorText).to.equal('Failed to save key');
  })

  it('should display dependency relations between keys', () => {
    const keyWithoutDependency = KeysPage.generateTestKeyName('key1');
    const keyWithoutDependencyFullPath = `${testFolder}/${dependentKeysFolder}/${keyWithoutDependency}`;
    KeysPage.addEmptyKey(keyWithoutDependencyFullPath);

    const keyWithDependency = KeysPage.generateTestKeyName('key2');
    const keyWithDependencyFullPath = `${testFolder}/${dependentKeysFolder}/${keyWithDependency}`;
    KeysPage.addEmptyKey(keyWithDependencyFullPath);

    browser.click(keySelectors.ADD_RULE_BUTTON);

    browser.setValue(conditionPropertyInputSelector, `keys.${keyWithoutDependencyFullPath}`);
    KeysPage.setConditionValue(1, 1, 'value');

    KeysPage.commitChanges();

    // Verify depends on
    KeysPage.goToKey(keyWithDependencyFullPath);
    browser.waitForVisible(keySelectors.DEPENDS_ON_TOGGLE, 5000);
    browser.click(keySelectors.DEPENDS_ON_TOGGLE);
    browser.waitForVisible(`${keySelectors.DEPENDS_ON} a[href="/keys/${keyWithoutDependencyFullPath}"]`);

    // Verify used by
    browser.waitUntil(() => {
      KeysPage.goToKey(keyWithoutDependencyFullPath);
      browser.waitForExist(`${keySelectors.USED_BY}[data-loaded= true]`, 1000);
      return browser.isVisible(keySelectors.USED_BY_TOGGLE);
    }, 5000);
    
    browser.click(keySelectors.USED_BY_TOGGLE);
    browser.waitForVisible(`${keySelectors.USED_BY} a[href="/keys/${keyWithDependencyFullPath}"]`);
  });
});

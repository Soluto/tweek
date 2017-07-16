/* global describe, before, beforeEach, after, afterEach, it, browser */

import KeysPageObject from '../../utils/KeysPageObject';
import keySelectors from '../../selectors/keySelectors';
import globalSelectors from '../../selectors/globalSelectors';
import { expect } from 'chai';

describe('dependent keys', () => {
  const keysPageObject = new KeysPageObject(browser);

  const testFolder = KeysPageObject.TEST_KEYS_FOLDER;
  const dependentKeysFolder = '@dependent_keys';
  const conditionPropertyInputSelector = keySelectors.conditionPropertyName(1, 1);

  before(() => {
    keysPageObject.goToBase();
    browser.windowHandleMaximize();
  });

  it('should save when no circular dependencies', () => {
    const keyWithoutDependency = keysPageObject.generateTestKeyName('key1');
    const keyWithoutDependencyFullPath = `${testFolder}/${dependentKeysFolder}/${keyWithoutDependency}`;
    keysPageObject.addEmptyKey(keyWithoutDependencyFullPath);

    const keyWithDependency = keysPageObject.generateTestKeyName('key2');
    const keyWithDependencyFullPath = `${testFolder}/${dependentKeysFolder}/${keyWithDependency}`;
    keysPageObject.addEmptyKey(keyWithDependencyFullPath);

    browser.click(keySelectors.ADD_RULE_BUTTON);

    browser.setValue(conditionPropertyInputSelector, `keys.${keyWithoutDependencyFullPath}`);
    keysPageObject.setConditionValue(1, 1, 'value');

    keysPageObject.commitChanges();
  });

  it('should not save circular dependencies', () => {
    const keyWithDependency1 = keysPageObject.generateTestKeyName('key1');
    const keyWithDependencyFullPath1 = `${testFolder}/${dependentKeysFolder}/${keyWithDependency1}`;
    const keyWithDependency2 = keysPageObject.generateTestKeyName('key2');
    const keyWithDependencyFullPath2 = `${testFolder}/${dependentKeysFolder}/${keyWithDependency2}`;
    const keyWithDependency3 = keysPageObject.generateTestKeyName('key3');
    const keyWithDependencyFullPath3 = `${testFolder}/${dependentKeysFolder}/${keyWithDependency3}`;

    keysPageObject.addEmptyKey(keyWithDependencyFullPath1);
    browser.click(keySelectors.ADD_RULE_BUTTON);
    browser.setValue(conditionPropertyInputSelector, `keys.${keyWithDependencyFullPath3}`);
    keysPageObject.setConditionValue(1, 1, 'value');
    keysPageObject.commitChanges();

    keysPageObject.addEmptyKey(keyWithDependencyFullPath2);
    browser.click(keySelectors.ADD_RULE_BUTTON);
    browser.setValue(conditionPropertyInputSelector, `keys.${keyWithDependencyFullPath1}`);
    keysPageObject.setConditionValue(1, 1, 'value');
    keysPageObject.commitChanges();

    keysPageObject.addEmptyKey(keyWithDependencyFullPath3);
    browser.click(keySelectors.ADD_RULE_BUTTON);
    browser.setValue(conditionPropertyInputSelector, `keys.${keyWithDependencyFullPath2}`);
    keysPageObject.setConditionValue(1, 1, 'value');
    browser.click(keySelectors.SAVE_CHANGES_BUTTON);

    browser.waitForVisible(globalSelectors.ERROR_NOTIFICATION_TITLE, KeysPageObject.GIT_TRANSACTION_TIMEOUT);
    const errorText = browser.getText(globalSelectors.ERROR_NOTIFICATION_TITLE);
    expect(errorText).to.equal('Failed to save key');
  })

  it('should display dependency relations between keys', () => {
    const keyWithoutDependency = keysPageObject.generateTestKeyName('key1');
    const keyWithoutDependencyFullPath = `${testFolder}/${dependentKeysFolder}/${keyWithoutDependency}`;
    keysPageObject.addEmptyKey(keyWithoutDependencyFullPath);

    const keyWithDependency = keysPageObject.generateTestKeyName('key2');
    const keyWithDependencyFullPath = `${testFolder}/${dependentKeysFolder}/${keyWithDependency}`;
    keysPageObject.addEmptyKey(keyWithDependencyFullPath);

    browser.click(keySelectors.ADD_RULE_BUTTON);

    browser.setValue(conditionPropertyInputSelector, `keys.${keyWithoutDependencyFullPath}`);
    keysPageObject.setConditionValue(1, 1, 'value');

    keysPageObject.commitChanges();

    // Verify depends on
    keysPageObject.goToKey(keyWithDependencyFullPath);
    browser.waitForVisible(keySelectors.DEPENDS_ON_TOGGLE, 5000);
    browser.click(keySelectors.DEPENDS_ON_TOGGLE);
    browser.waitForVisible(`${keySelectors.DEPENDS_ON} a[href="/keys/${keyWithoutDependencyFullPath}"]`);

    // Verify used by
    browser.waitUntil(() => {
      keysPageObject.goToKey(keyWithoutDependencyFullPath);
      browser.waitForExist(`${keySelectors.USED_BY}[data-loaded= true]`, 1000);
      return browser.isVisible(keySelectors.USED_BY_TOGGLE);
    }, 5000);
    
    browser.click(keySelectors.USED_BY_TOGGLE);
    browser.waitForVisible(`${keySelectors.USED_BY} a[href="/keys/${keyWithDependencyFullPath}"]`);
  });
});

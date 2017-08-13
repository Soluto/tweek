/* global describe, before, beforeEach, after, afterEach, it, browser */

import * as KeyUtils from '../../utils/KeysPage';
import Rule from '../../utils/Rule';
import keySelectors from '../../selectors/keySelectors';
import globalSelectors from '../../selectors/globalSelectors';
import { expect } from 'chai';

describe('dependent keys', () => {
  const testFolder = '@behavior_tests';
  const dependentKeysFolder = '@dependent_keys';

  before(() => {
    browser.windowHandleMaximize();
  });

  it('should save when no circular dependencies', () => {
    const keyWithoutDependency = KeyUtils.generateTestKeyName('key1');
    const keyWithoutDependencyFullPath = `${testFolder}/${dependentKeysFolder}/${keyWithoutDependency}`;
    KeyUtils.addEmptyKey(keyWithoutDependencyFullPath);

    const keyWithDependency = KeyUtils.generateTestKeyName('key2');
    const keyWithDependencyFullPath = `${testFolder}/${dependentKeysFolder}/${keyWithDependency}`;
    KeyUtils.addEmptyKey(keyWithDependencyFullPath);

    Rule.add().withCondition(`keys.${keyWithoutDependencyFullPath}`, 'value');
    KeyUtils.commitChanges();
  });

  it('should not save circular dependencies', () => {
    const keyWithDependency1 = KeyUtils.generateTestKeyName('key1');
    const keyWithDependencyFullPath1 = `${testFolder}/${dependentKeysFolder}/${keyWithDependency1}`;
    const keyWithDependency2 = KeyUtils.generateTestKeyName('key2');
    const keyWithDependencyFullPath2 = `${testFolder}/${dependentKeysFolder}/${keyWithDependency2}`;
    const keyWithDependency3 = KeyUtils.generateTestKeyName('key3');
    const keyWithDependencyFullPath3 = `${testFolder}/${dependentKeysFolder}/${keyWithDependency3}`;

    KeyUtils.addEmptyKey(keyWithDependencyFullPath1);
    Rule.add().withCondition(`keys.${keyWithDependencyFullPath3}`, 'value');
    KeyUtils.commitChanges();

    KeyUtils.addEmptyKey(keyWithDependencyFullPath2);
    Rule.add().withCondition(`keys.${keyWithDependencyFullPath1}`, 'value');
    KeyUtils.commitChanges();

    KeyUtils.addEmptyKey(keyWithDependencyFullPath3);
    Rule.add().withCondition(`keys.${keyWithDependencyFullPath2}`, 'value');
    browser.click(keySelectors.SAVE_CHANGES_BUTTON);

    browser.waitForVisible(globalSelectors.ERROR_NOTIFICATION_TITLE, KeyUtils.defaultTimeout);
    const errorText = browser.getText(globalSelectors.ERROR_NOTIFICATION_TITLE);
    expect(errorText).to.equal('Failed to save key');
  })

  it('should display dependency relations between keys', () => {
    const keyWithoutDependency = KeyUtils.generateTestKeyName('key1');
    const keyWithoutDependencyFullPath = `${testFolder}/${dependentKeysFolder}/${keyWithoutDependency}`;
    KeyUtils.addEmptyKey(keyWithoutDependencyFullPath);

    const keyWithDependency = KeyUtils.generateTestKeyName('key2');
    const keyWithDependencyFullPath = `${testFolder}/${dependentKeysFolder}/${keyWithDependency}`;
    KeyUtils.addEmptyKey(keyWithDependencyFullPath);

    Rule.add().withCondition(`keys.${keyWithoutDependencyFullPath}`, 'value');

    KeyUtils.commitChanges();

    // Verify depends on
    KeyUtils.goToKey(keyWithDependencyFullPath);
    browser.waitForVisible(keySelectors.DEPENDS_ON_TOGGLE, 5000);
    browser.click(keySelectors.DEPENDS_ON_TOGGLE);
    browser.waitForVisible(`${keySelectors.DEPENDS_ON} a[href="/keys/${keyWithoutDependencyFullPath}"]`);

    // Verify used by
    browser.waitUntil(() => {
      KeyUtils.goToKey(keyWithoutDependencyFullPath);
      browser.waitForExist(`${keySelectors.USED_BY}[data-loaded= true]`, 1000);
      return browser.isVisible(keySelectors.USED_BY_TOGGLE);
    }, 5000);
    
    browser.click(keySelectors.USED_BY_TOGGLE);
    browser.waitForVisible(`${keySelectors.USED_BY} a[href="/keys/${keyWithDependencyFullPath}"]`);
  });
});

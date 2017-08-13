import assert from 'assert';
import * as KeyUtils from './utils/KeysPage';
import PageAsserts from './PageAsserts';
import selectors from './selectors/keySelectors';
import { expect } from 'chai';

export default class KeysAsserts {
  static assertKeyOpened(keyName) {
    KeysAsserts.assertIsInKeyPage(keyName, `should be in ${keyName} key page`);
    browser.waitForVisible(selectors.KEY_VIEWER_CONTAINER, 4000);
    assert(!KeyUtils.hasChanges(), 'should not have changes');
    assert(!KeyUtils.isSaving(), 'should not be in saving state');
  }

  static assertKeySource(expectedSourceObject) {
    let keySourceObject;
    try {
      keySourceObject = KeyUtils.getKeySource();
    }
    catch (exp) {
      assert(false, 'failed read key source, ' + exp);
    }

    const deleteIds = (rulesObject, depth) => {
      if (depth === 0) {
        rulesObject.forEach(matcher => { delete matcher['Id']; });
        return;
      }
      Object.keys(rulesObject).forEach(key => deleteIds(rulesObject[key], depth -1));
    };

    deleteIds(keySourceObject.rules, keySourceObject.partitions.length);
    deleteIds(expectedSourceObject.rules, expectedSourceObject.partitions.length);

    assert.deepEqual(keySourceObject, expectedSourceObject);
  }

  static assertKeyHasNumberOfRules(expectedNumberOfRules, message = 'should have correct ammount of rules') {
    assert.equal(KeyUtils.getNumberOfRules(), expectedNumberOfRules, message);
  }

  static assertIsInKeyPage(expectedKey, message) {
    PageAsserts.assertIsInPage(`keys/${expectedKey}`, message);
  }

  static assertIsKeyExistsAfterTransaction(keyName, isExisting, message) {
    //todo use authoring
    if (!isExisting) KeyUtils.waitForKeyToBeDeleted(keyName);

    KeyUtils.goToKey(keyName, 1000, false);
    assert(isExisting === browser.isExisting(selectors.KEY_VIEWER_CONTAINER), message);
  }
}

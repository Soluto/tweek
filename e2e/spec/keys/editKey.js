/* global describe, before, after it, browser */

import KeysAsserts from '../../KeysAsserts';
import KeysPageObject from '../../KeysPageObject';
import assert from 'assert';
import {selectors} from '../../selectors';

describe('edit key', () => {
  const keysPageObject = new KeysPageObject(browser);

  const keyToEdit = keysPageObject.generateTestKeyName('edit_key_test');
  const testFolder = KeysPageObject.TEST_KEYS_FOLDER;
  const editKeyTestFolder = '@edit_key';
  const keyToEditFullPath = `${testFolder}/${editKeyTestFolder}/${keyToEdit}`;

  const keysAsserts = new KeysAsserts(keysPageObject, browser);

  const expectedKeySource = {
    partitions: [],
    valueType: "string",
    rules: [{
      "Id": "985627a1-d627-5516-89a9-79bc1b5515d0",
      "Matcher": {
        "device.AgentVersion": "1.1.1",
        "device.CountryCode": "someValue 1",
        "device.CreatedAt": {
          "$withinTime": "3d"
        }
      },
      "Value": "",
      "Type": "SingleVariant"
    },
    {
      "Id": "b74a6ea7-3ad6-58bd-9159-8460162b2e42",
      "Matcher": {},
      "Value": "some value",
      "Type": "SingleVariant"
    }],
    defaultValue: 'some default value'
  };

  before(() => {
    keysPageObject.goToBase();
    keysPageObject.addEmptyKey(keyToEditFullPath);
  });

  after(() => {
    keysPageObject.deleteKeyIfExists(keyToEditFullPath);
  });

  function addRuleAndAssertItsFocus(numberOfRules) {

    for (var i = 0; i < numberOfRules; i++) {
      let ruleFirstConditionPropertyName = selectors.conditionPropertyName(i, 1);
      browser.click(selectors.ADD_RULE_BUTTON);
      assert(browser.hasFocus(ruleFirstConditionPropertyName), 'should focus the added rule first condition property name');
    }
  }

  it('should succeed editing key', () => {
    keysPageObject.goToKey(keyToEditFullPath);
    browser.windowHandleMaximize();
    keysAsserts.assertKeyOpened(keyToEditFullPath);

    addRuleAndAssertItsFocus(2);
    keysAsserts.assertKeyHasNumberOfRules(2);

    keysPageObject.setConditionPropertyFromSuggestion(1, 1, 2);
    keysPageObject.addRuleCondition(1);
    keysPageObject.setConditionPropertyFromSuggestion(1, 2, 0);

    keysPageObject.setConditionValue(1, 1, 'someValue 1');
    keysPageObject.setConditionValue(1, 2, '1.1.1');

    keysPageObject.addRuleCondition(1);

    keysPageObject.setConditionPropertyFromSuggestionValuePrefix(1, 3, 'Create');
    keysPageObject.setConditionValue(1, 3, '3d');

    keysPageObject.removeRuleCondition(2, 0);
    keysPageObject.setRuleValue(2, 'some value');

    browser.setValue(selectors.DEFAULT_VALUE_INPUT, 'some default value');

    keysAsserts.assertKeySource(expectedKeySource);

    keysPageObject.saveChanges();

    browser.refresh();
    keysPageObject.waitForPageToLoad(keyToEditFullPath);

    keysAsserts.assertKeySource(expectedKeySource);
  });
});
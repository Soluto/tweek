/* global describe, before, after it, browser */

import KeysAsserts from '../KeysAsserts';
import KeysPageObject from '../KeysPageObject';
import assert from 'assert';
import { selectors, getRelativeSelector } from '../selectors';

describe('edit key', () => {
  const keysPageObject = new KeysPageObject(browser);

  const keyToEdit = keysPageObject.generateTestKeyName('editKeyTest');
  const testFolder = KeysPageObject.TEST_KEYS_FOLDER;
  const editKeyTestFolder = '@editKey';
  const keyToEditFullPath = `${testFolder}/${editKeyTestFolder}/${keyToEdit}`;

  const keysAsserts = new KeysAsserts(keysPageObject, browser);

  const expectedKeySource = {
    Partitions: [],
    ValueType: "string",
    Rules: [{
      "Id": "021430ef-d234-5b96-bd00-23ab5c78b054",
      "Matcher": {
        "": ""
      },
      "Value": "",
      "Type": "SingleVariant"
    },
    {
      "Id": "985627a1-d627-5516-89a9-79bc1b5515d0",
      "Matcher": {
        "device.PartnerBrandId": "someValue",
        "": "someValue"
      },
      "Value": "",
      "Type": "SingleVariant"
    },
    {
      "Id": "c18c1d7a-66e3-50eb-800f-9ec6f006374e",
      "Matcher": {
        "": ""
      },
      "Value": "",
      "Type": "SingleVariant"
    },
    {
      "Id": "b74a6ea7-3ad6-58bd-9159-8460162b2e42",
      "Matcher": {},
      "Value": "some default value",
      "Type": "SingleVariant"
    }]
  };

  before(() => {
    browser.url(KeysPageObject.BASE_URL);
    keysPageObject.addEmptyKey(keyToEditFullPath);
  });

  after(() => {
    keysPageObject.deleteKeyIfExists(keyToEditFullPath);
  });

  function addRuleAndAssertItsFocus(numberOfRules) {
    const firstRuleConditionPropertyName = selectors.conditionPropertyName();

    while (numberOfRules > 0) {
      browser.click(selectors.ADD_RULE_BUTTON);

      assert(browser.hasFocus(firstRuleConditionPropertyName), 'should focus the added rule first condition property name');
      numberOfRules--;
    }
  }

  it('should succeed editing key', () => {
    keysPageObject.goToKey(keyToEditFullPath);
    browser.windowHandleMaximize();
    keysAsserts.assertKeyOpened(keyToEditFullPath);

    addRuleAndAssertItsFocus(3);
    keysAsserts.assertKeyHasNumberOfRules(4);
    const secondRule = selectors.ruleContainer(2);

    const secondRuleFirstConditionPropertyName = getRelativeSelector([secondRule, selectors.conditionPropertyName()]);
    const secondRuleFirstConditionValue = getRelativeSelector([secondRule, selectors.conditionValue()]);
    const secondSuggestion = selectors.conditionPropertyNameSuggestion(2);
    const secondRuleAddConditionButton = getRelativeSelector([secondRule, selectors.ADD_CONDITION_BUTTON]);

    browser.click(selectors.BACKGROUND); // to close the auto focus suggestions
    browser.click(secondRuleFirstConditionPropertyName);
    browser.click(secondSuggestion);
    browser.click(secondRuleAddConditionButton);

    browser.setValue(secondRuleFirstConditionValue, 'someValue');

    browser.setValue(selectors.DEFAULT_VALUE_INPUT, 'some default value');
    keysAsserts.assertKeySource(expectedKeySource);

    browser.click(selectors.SAVE_CHANGES_BUTTON);
    browser.waitUntil(() => keysPageObject.isSaving(), 5000, 'should move to in saving state');

    browser.waitUntil(() => !keysPageObject.isSaving(), KeysPageObject.GIT_TRANSACTION_TIMEOUT);

    browser.refresh();
    keysPageObject.waitForPageToLoad(keyToEditFullPath);

    keysAsserts.assertKeySource(expectedKeySource);
  });
});
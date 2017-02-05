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
    partitions: [],
    valueType: "string",
    rules: [{
      "Id": "985627a1-d627-5516-89a9-79bc1b5515d0",
      "Matcher": {
        "device.PartnerBrandId": "someValue 1",
        "device.@@id": "id",
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

    addRuleAndAssertItsFocus(1);
    keysAsserts.assertKeyHasNumberOfRules(2);
    const firstRule = selectors.ruleContainer(1);

    const firstRuleFirstConditionPropertyName = selectors.conditionPropertyName(1, 1);
    const firstRuleFirstConditionValue = selectors.conditionValue(1, 1);

    const firstSuggestion = selectors.typeaheadSuggestionByIndex(0);
    const secondSuggestion = selectors.typeaheadSuggestionByIndex(2);

    const firstRuleAddConditionButton = getRelativeSelector([firstRule, selectors.ADD_CONDITION_BUTTON]);

    browser.click(selectors.BACKGROUND); // to close the auto focus suggestions

    browser.click(firstRuleFirstConditionPropertyName);
    browser.click(secondSuggestion);

    browser.click(firstRuleAddConditionButton);

    const firstRuleSecondConditionPropertyName = selectors.conditionPropertyName(1, 2);
    const firstRuleSecondConditionValue = selectors.conditionValue(1, 2);

    browser.click(firstRuleSecondConditionPropertyName);
    browser.click(firstSuggestion);

    browser.setValue(firstRuleFirstConditionValue, 'someValue 1');
    browser.setValue(firstRuleSecondConditionValue, 'id');

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
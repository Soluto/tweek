/* global describe, before, after it, browser */

import KeysAsserts from './KeysAsserts';
import KeysPageObject from '../KeysPageObject';
import assert from 'assert';
import { selectors, getRelativeSelector } from '../selectors';

describe('edit key', () => {
  const keysPageObject = new KeysPageObject(browser);

  const keyToEdit = keysPageObject.generateKeyName('editKeyTest');
  const testFolder = '@tests';
  const behaviorTestFolder = `${testFolder}/behavior`;
  const keyToEditFullPath = `${behaviorTestFolder}/${keyToEdit}`;

  const keysAsserts = new KeysAsserts(keysPageObject, browser);

  const expectedKeySource = `[
    {
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
    }
]`;

  before(() => {
    browser.url(KeysPageObject.BASE_URL);
    keysPageObject.addEmptyKey(keyToEditFullPath);
  });

  function readAndAssertKeySource() {
    browser.waitForVisible(selectors.TAB_ITEM_HEADER, 2000);
    browser.click(selectors.SOURCE_TAB_ITEM);
    const keySourceCode = browser.getText(selectors.KEY_SOURCE_TEXT);
    browser.click(selectors.RULES_TAB_ITEM);

    keysAsserts.assertKeySource(keySourceCode, expectedKeySource);
  }

  function addRuleAndAssertItsFocus(numberOfRules) {
    const firstRuleConditionPropertyName = selectors.conditionPropertyName();

    while (numberOfRules > 0) {
      browser.click(selectors.ADD_RULE_BUTTON);

      assert(browser.hasFocus(firstRuleConditionPropertyName), 'should focus the added rule first condition property name');
      numberOfRules--;
    }
  }

  it('should succeed editing key', () => {
    const saveChangesTimeout = 10000;

    keysPageObject.goToKey(keyToEditFullPath);
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

    readAndAssertKeySource();

    browser.click(selectors.SAVE_CHANGES_BUTTON);
    assert(keysPageObject.isSaving(), 'should move to in saving state');

    browser.waitUntil(() => !keysPageObject.isSaving(), saveChangesTimeout);

    browser.refresh();

    readAndAssertKeySource();
  });
});


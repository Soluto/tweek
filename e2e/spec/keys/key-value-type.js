/* global describe, before, after it, browser */

import KeysAsserts from '../../KeysAsserts';
import KeysPageObject from '../../KeysPageObject';
import {selectors} from '../../selectors';

const BLANK_KEY_NAME = '_blank';

describe('key-value-type', () => {
  const keysPageObject = new KeysPageObject(browser);
  const keysAsserts = new KeysAsserts(keysPageObject, browser);

  before(() => {
    keysPageObject.goToBase();
    browser.windowHandleMaximize();
    browser.click(selectors.ADD_KEY_BUTTON);
    keysAsserts.assertKeyOpened(BLANK_KEY_NAME);
    browser.click(selectors.ADD_RULE_BUTTON);
    browser.waitForExist(selectors.ruleContainer(0));
    keysPageObject.removeRuleCondition(1, 0);
  });

  let setKeyValueAndType = function (keyValueType, value) {
    browser.setValue(selectors.KEY_VALUE_TYPE_INPUT, keyValueType);
    const firstSuggestion = selectors.typeaheadSuggestionByIndex(0);
    browser.click(firstSuggestion);

    keysPageObject.acceptRodalIfRaised();

    const ruleValueInputSelector = selectors.ruleValueInput(0, keyValueType == "Boolean");
    browser.setValue(ruleValueInputSelector, value);
    if (keyValueType == "Boolean") browser.click(firstSuggestion);
  };

  function assertKeySourceWithChanges(valueType, ruleValue) {
    let expectedResult = {
      "partitions": [],
      "valueType": valueType,
      "rules": [{
        "Id": "b74a6ea7-3ad6-58bd-9159-8460162b2e42",
        "Matcher": {},
        "Value": ruleValue,
        "Type": "SingleVariant"
      }]
    };

    keysAsserts.assertKeySource(expectedResult);
  }

  it('Should convert the value type of the jpad according to the key value type', () => {
    setKeyValueAndType('String', 'someValue');
    assertKeySourceWithChanges("string", "someValue");

    setKeyValueAndType('Number', '5');
    assertKeySourceWithChanges("number", 5);

    setKeyValueAndType('Boolean', 'true');
    assertKeySourceWithChanges("boolean", true);

    setKeyValueAndType('Boolean', 'false');
    assertKeySourceWithChanges("boolean", false);

    setKeyValueAndType('Version', '1.1.1');
    assertKeySourceWithChanges("version", '1.1.1');
  });
});
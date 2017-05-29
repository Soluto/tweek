/* global describe, before, after, it, browser */

import KeysAsserts from '../../KeysAsserts';
import KeysPageObject, { BLANK_KEY_NAME } from '../../utils/KeysPageObject';
import keySelectors from '../../selectors/keySelectors';
import globalSelectors from '../../selectors/globalSelectors';

describe('key-value-type', () => {
  const keysPageObject = new KeysPageObject(browser);
  const keysAsserts = new KeysAsserts(keysPageObject, browser);

  before(() => {
    keysPageObject.goToBase();
    browser.windowHandleMaximize();
    browser.click(keySelectors.ADD_KEY_BUTTON);
    keysAsserts.assertKeyOpened(BLANK_KEY_NAME);
    browser.click(keySelectors.ADD_RULE_BUTTON);
    browser.waitForExist(keySelectors.ruleContainer(0));
    keysPageObject.removeRuleCondition(1, 0);
  });

  let setKeyValueAndType = function (keyValueType, value) {
    browser.setValue(keySelectors.KEY_VALUE_TYPE_INPUT, keyValueType);

    keysPageObject.acceptRodalIfRaised();

    const ruleValueInputSelector = keySelectors.ruleValueInput(0, keyValueType == "Boolean");
    browser.setValue(ruleValueInputSelector, value);
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
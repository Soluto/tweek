/* global describe, before, after it, browser */

import KeysAsserts from '../KeysAsserts';
import KeysPageObject from '../KeysPageObject';
import assert from 'assert';
import { selectors, getRelativeSelector } from '../selectors';
import { BLANK_KEY_NAME } from '../../../modules/store/ducks/ducks-utils/blankKeyDefinition';

describe('key-value-type', () => {
  const keysPageObject = new KeysPageObject(browser);

  const keysAsserts = new KeysAsserts(keysPageObject, browser);

  const keyValueTypesAssertions = [];
  const addKeyValueTypeAssertion = (keyValueTypeInput,
    jpadKeyValueType,
    ruleIndexToAssert,
    ruleValue,
    jpadRuleValue) => {
    keyValueTypesAssertions.push({
      keyValueTypeInput,
      jpadKeyValueType,
      ruleIndexToAssert,
      ruleValue,
      jpadRuleValue,
    });
  }

  let expectedKeySource = {
    "Partitions": [],
    "ValueType": "",
    "Rules": [{
      "Id": "b74a6ea7-3ad6-58bd-9159-8460162b2e42",
      "Matcher": {},
      "Value": "",
      "Type": "SingleVariant"
    }]
  };

  before(() => {
    browser.url(KeysPageObject.BASE_URL);
    browser.windowHandleMaximize();
  });

  it('should succeed editing key', () => {
    browser.click(selectors.ADD_KEY_BUTTON);
    keysAsserts.assertKeyOpened(BLANK_KEY_NAME);

    addKeyValueTypeAssertion('String', 'string', 0, 'value', 'value');
    addKeyValueTypeAssertion('Number', 'number', 0, '5', 5);
    addKeyValueTypeAssertion('Number', 'number', 0, 5, 5);
    addKeyValueTypeAssertion('Bool', 'bool', 0, 'true', true);
    addKeyValueTypeAssertion('Bool', 'bool', 0, 'false', false);
    addKeyValueTypeAssertion('Version', 'version', 0, '5.0.6', '5.0.6');

    keyValueTypesAssertions.forEach(x => {
      browser.setValue(selectors.KEY_VALUE_TYPE_INPUT, x.keyValueTypeInput);
      expectedKeySource.ValueType = x.jpadKeyValueType;

      const ruleValueInputSelector = selectors.ruleValueInput(x.ruleIndexToAssert);
      browser.setValue(ruleValueInputSelector, x.ruleValue);
      expectedKeySource.Rules[x.ruleIndexToAssert].Value = x.jpadRuleValue;

      keysAsserts.assertKeySource(expectedKeySource);
    });
  });
});
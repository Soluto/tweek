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
    jpadRuleValue,
    isValueContainsSuggestions) => {
    keyValueTypesAssertions.push({
      keyValueTypeInput,
      jpadKeyValueType,
      ruleIndexToAssert,
      ruleValue,
      jpadRuleValue,
      isValueContainsSuggestions,
    });
  }

  let expectedKeySource = {
    "partitions": [],
    "valueType": "",
    "rules": [{
      "Id": "b74a6ea7-3ad6-58bd-9159-8460162b2e42",
      "Matcher": {},
      "Value": "",
      "Type": "SingleVariant"
    }]
  };

  before(() => {
    browser.url(KeysPageObject.BASE_URL);
    browser.windowHandleMaximize();
    browser.click(selectors.ADD_KEY_BUTTON);
    keysAsserts.assertKeyOpened(BLANK_KEY_NAME);

    const ruleValueInputSelector = selectors.ruleValueInput(0, false);
    browser.setValue(ruleValueInputSelector, 'initialize value');
  });

  addKeyValueTypeAssertion('String', 'string', 0, 'value', 'value', false);
  addKeyValueTypeAssertion('Number', 'number', 0, '5', 5, false);
  addKeyValueTypeAssertion('Number', 'number', 0, 5, 5, false);
  addKeyValueTypeAssertion('Boolean', 'boolean', 0, 'true', true, true);
  addKeyValueTypeAssertion('Boolean', 'boolean', 0, 'false', false, true);
  addKeyValueTypeAssertion('Version', 'version', 0, '5.0.6', '5.0.6', false);

  keyValueTypesAssertions.forEach(x => {
    it('should succeed editing key for value type:' + x.keyValueTypeInput, () => {
      browser.setValue(selectors.KEY_VALUE_TYPE_INPUT, x.keyValueTypeInput);
      const firstSuggestion = selectors.typeaheadSuggestionByIndex(0);
      browser.click(firstSuggestion);

      expectedKeySource.valueType = x.jpadKeyValueType;

      browser.waitUntil(() => keysPageObject.didAlertRaised(), 2000, 'should have shown changing value type alert');
      browser.alertAccept();

      const ruleValueInputSelector = selectors.ruleValueInput(x.ruleIndexToAssert, x.isValueContainsSuggestions);

      browser.setValue(ruleValueInputSelector, x.ruleValue);
      if (x.isValueContainsSuggestions) browser.click(firstSuggestion);

      expectedKeySource.rules[x.ruleIndexToAssert].Value = x.jpadRuleValue;

      keysAsserts.assertKeySource(expectedKeySource);
    });
  });
});
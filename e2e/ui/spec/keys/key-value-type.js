/* global describe, before, after, it, browser */

import * as KeysAsserts from '../../utils/key-asserts';
import { goToKey, acceptRodalIfRaised, BLANK_KEY_NAME } from '../../utils/key-utils';
import Rule from '../../utils/Rule';
import { dataComp } from '../../utils/selector-utils';

describe('key-value-type', () => {
  before(() => {
    goToKey(BLANK_KEY_NAME);
    Rule.add().removeCondition();
  });

  const expected = (valueType, Value) => ({
    partitions: [],
    valueType,
    rules: [
      {
        Matcher: {},
        Value,
        Type: 'SingleVariant',
      },
    ],
  });
  const testCase = (valueType, value) => ({
    valueType,
    value,
    expected: expected(valueType, value),
  });
  const testCases = [
    testCase('string', 'someValue'),
    testCase('number', 0),
    testCase('number', 5),
    testCase('boolean', true),
    testCase('boolean', false),
    testCase('version', '1.1.1'),
  ];

  testCases.forEach(({ valueType, value, expected }) => {
    it(`should convert the type of the jpad to ${valueType}`, () => {
      browser.setValue(dataComp('key-value-type-selector'), valueType);
      acceptRodalIfRaised();

      Rule.select().setValue(value, valueType);

      KeysAsserts.assertKeySource(expected);
    });
  });
});

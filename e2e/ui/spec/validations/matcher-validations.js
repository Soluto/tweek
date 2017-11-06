/* global describe, before, after, it, browser */

import Key from '../../utils/Key';
import Rule from '../../utils/Rule';
import { dataComp } from '../../utils/selector-utils';

describe('matcher validations', () => {
  const testCase = (property, isValid) => ({ property, isValid });
  const testCases = [
    testCase('unknown.identity', false),
    testCase('not_a_property', false),
    testCase('user.FavoriteFruit', true),
    testCase('keys.some_key', true),
  ];

  it('should show validation icon when identity is unknown', () => {
    Key.add()
      .setName('matcher/validation')
      .setValueType('string')
      .setKeyFormat('jpad')
      .continueToDetails();
    const rule = Rule.add();

    const validationIcon = property =>
      `${rule._condition(property)} ${dataComp('validation-icon')}`;

    testCases.forEach(({ property }) => rule.setCondition(property));

    testCases.forEach(({ property, isValid }) =>
      browser.waitForVisible(validationIcon(property), 5000, isValid),
    );
  });
});

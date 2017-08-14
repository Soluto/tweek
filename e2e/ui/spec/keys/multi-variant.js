/* global describe, before, beforeEach, after, it, browser */

import assert from 'assert';
import { expect } from 'chai';
import * as KeyUtils from '../../utils/key-utils';
import { keyValueTypeSelector, BLANK_KEY_NAME } from '../../utils/key-utils';
import Rule from '../../utils/Rule';

describe('MultiVariant value type', () => {
  beforeEach(() => KeyUtils.goToKey(BLANK_KEY_NAME));

  it('should succeed editing boolean value type', () => {
    const expectedValue = {
      Matcher: {},
      Type: 'MultiVariant',
      OwnerType: 'user',
      ValueDistribution: {
        type: 'bernoulliTrial',
        args: 0.1,
      },
    };

    browser.setValue(keyValueTypeSelector, 'boolean');

    Rule.add().removeCondition().multiVariant().withIdentity('user');

    let ruleSource = KeyUtils.getKeySource().rules[0];
    expect(ruleSource).to.have.property('Salt');

    const salt = ruleSource.Salt;
    expect(salt).to.not.equal('');
    delete ruleSource.Salt;

    assert.deepEqual(ruleSource, expectedValue);

    Rule.select().singleValue().multiVariant();

    ruleSource = KeyUtils.getKeySource().rules[0];
    expect(ruleSource.Salt).to.equal(salt);
  });

  it('should succeed editing other value types', () => {
    const args = {
      val1: 20,
      val2: 35,
      val3: 45,
    };
    const expectedValue = {
      Matcher: {},
      Type: 'MultiVariant',
      OwnerType: 'other',
      ValueDistribution: {
        type: 'weighted',
        args,
      },
    };

    browser.setValue(keyValueTypeSelector, 'string');

    Rule.add().removeCondition().multiVariant().setValues(args).withIdentity('other');

    let value = KeyUtils.getKeySource().rules[0];
    expect(value).to.have.property('Salt');

    const salt = value.Salt;
    expect(salt).to.not.equal('');

    delete value.Salt;
    assert.deepEqual(value, expectedValue);

    Rule.select().singleValue().multiVariant();

    value = KeyUtils.getKeySource().rules[0];
    expect(value.Salt).to.equal(salt);
  });
});

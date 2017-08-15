/* global describe, before, beforeEach, after, it, browser */

import { expect } from 'chai';
import Key from '../../utils/Key';
import Rule from '../../utils/Rule';

describe('MultiVariant value type', () => {
  beforeEach(() => Key.add());

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

    Key.withValueType('boolean');

    Rule.add().removeCondition().multiVariant().withIdentity('user');

    let ruleSource = Key.source.rules[0];
    expect(ruleSource).to.have.property('Salt');

    const salt = ruleSource.Salt;
    expect(salt).to.not.equal('');
    delete ruleSource.Salt;

    expect(ruleSource).to.deep.equal(expectedValue);

    Rule.select().singleValue().multiVariant();

    ruleSource = Key.source.rules[0];
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

    Key.withValueType('string');

    Rule.add().removeCondition().multiVariant().setValues(args).withIdentity('other');

    let value = Key.source.rules[0];
    expect(value).to.have.property('Salt');

    const salt = value.Salt;
    expect(salt).to.not.equal('');

    delete value.Salt;
    expect(value).to.deep.equal(expectedValue);

    Rule.select().singleValue().multiVariant();

    value = Key.source.rules[0];
    expect(value.Salt).to.equal(salt);
  });
});

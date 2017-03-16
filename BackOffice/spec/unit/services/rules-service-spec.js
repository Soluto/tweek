/* global jest, before, beforeEach, describe, it, expect */
jest.unmock('../../../modules/services/rules-service');

import * as RulesService from '../../../modules/services/rules-service';
import {assert, expect} from 'chai';

const fakeId = 'someId';
const idGenerator = {
  guid: () => fakeId
};
const ruleValue = "someValue";
const explicitRuleValue = {
  Id: fakeId,
  Matcher: {},
  Value: ruleValue,
  Type: "SingleVariant"
};


describe('rules-service', () => {
  describe('addPartition', () => {
    const partition = "somePartition";

    const rulesToCheck = [
      {expected: {'*': []}, partition, rules: [], depth: 0},
      {
        expected: {
          someValue: [{Matcher: {}}],
          '*': [{Matcher: {}}]
        },
        partition,
        rules: [{Matcher: {[partition]: 'someValue'}}, {Matcher: {}}],
        depth: 0
      },
      {
        expected: {
          partition1: {'someValue': [{Matcher: {}}], '*': [{Matcher: {}}]},
          partition2: {'*': []}
        },
        partition,
        rules: {
          partition1: [{Matcher: {[partition]: 'someValue'}}, {Matcher: {}}],
          partition2: []
        },
        depth: 1
      },
    ];

    rulesToCheck.forEach(({expected, partition, rules, depth}) => {
      it('should add partition', () => {
        const result = RulesService.addPartition(partition, rules, depth);
        assert.deepEqual(result, expected);
      })
    })
  });

  describe('convertToExplicitRules', () => {
    const rulesToCheck = [
      {
        expected: [explicitRuleValue],
        rule: ruleValue,
        depth: 0
      },
      {
        expected: [explicitRuleValue],
        rule: [explicitRuleValue],
        depth: 0
      },
      {
        expected: {'*': [explicitRuleValue]},
        rule: ruleValue,
        depth: 1
      },
      {
        expected: {'*': [explicitRuleValue]},
        rule: [explicitRuleValue],
        depth: 1
      },
      {
        expected: {
          somePartition1: [explicitRuleValue],
          somePartition2: [explicitRuleValue]
        },
        rule: {
          somePartition1: ruleValue,
          somePartition2: [explicitRuleValue]
        },
        depth: 1
      },
      {
        expected: {'*': {'*': [explicitRuleValue]}},
        rule: ruleValue,
        depth: 2
      },
      {
        expected: {'*': {'*': [explicitRuleValue]}},
        rule: [explicitRuleValue],
        depth: 2
      },
      {
        expected: {
          somePartition1: {'*': [explicitRuleValue]},
          somePartition2: {'*': [explicitRuleValue]},
          somePartition3: {innerPartition: [explicitRuleValue]},
          somePartition4: {innerPartition: [explicitRuleValue]}
        },
        rule: {
          somePartition1: ruleValue,
          somePartition2: [explicitRuleValue],
          somePartition3: {innerPartition: ruleValue},
          somePartition4: {innerPartition: [explicitRuleValue]}
        },
        depth: 2
      },
    ];

    rulesToCheck.forEach(({expected, rule, depth}) => {
      it('should convert to explicit', () => {
        const result = RulesService.convertToExplicitRules(rule, depth, idGenerator);
        assert.deepEqual(result, expected);
      });
    });
  });

  describe('convertToExplicitKey', () => {
    it ('should convert to explicit key', () => {
      const key = {
        partitions: ['p1','p2'],
        rules: {
          somePartition1: ruleValue,
          somePartition2: [explicitRuleValue],
          somePartition3: {innerPartition: ruleValue},
          somePartition4: {innerPartition: [explicitRuleValue]}
        },
        valueType: 'someType'
      };
      const expected = {
        partitions: ['p1','p2'],
        rules: {
          somePartition1: {'*': [explicitRuleValue]},
          somePartition2: {'*': [explicitRuleValue]},
          somePartition3: {innerPartition: [explicitRuleValue]},
          somePartition4: {innerPartition: [explicitRuleValue]}
        },
        valueType: 'someType'
      };
      const result = RulesService.convertToExplicitKey(key, idGenerator);
      assert.deepEqual(result, expected);
    });
  });
});

/* global jest, before, beforeEach, describe, it, expect */
import { assert, expect } from 'chai';
import * as RulesService from '../../../modules/services/rules-service';

jest.unmock('../../../modules/services/rules-service');

const toExplicitRule = Value => ({
  Matcher: {},
  Value,
  Type: 'SingleVariant',

});

describe('rules-service', () => {
  describe('addPartition', () => {
    const PARTITION_NAME = 'somePartition';

    const rulesToCheck = [
      { expected: { '*': [] }, PARTITION_NAME, rules: [], depth: 0 },
      {
        expected: {
          someValue1: [{ Matcher: {} }],
          someValue2: [
            { Matcher: {} },
            { Matcher: { property: 'someValue' } },
          ],
          '*': [{ Matcher: {} }],
        },
        PARTITION_NAME,
        rules: [
          { Matcher: { [PARTITION_NAME]: 'someValue1' } },
          { Matcher: { [PARTITION_NAME]: 'someValue2' } },
          { Matcher: { [PARTITION_NAME]: 'someValue2', property: 'someValue' } },
          { Matcher: {} },
        ],
        depth: 0,
      },
      {
        expected: {
          partition1: {
            someValue: [
              { Matcher: {} },
              { Matcher: { property: 'someValue2' } },
            ],
            '*': [{ Matcher: {} }],
          },
          partition2: { '*': [] },
        },
        PARTITION_NAME,
        rules: {
          partition1: [
            { Matcher: { [PARTITION_NAME]: 'someValue' } },
            { Matcher: { [PARTITION_NAME]: 'someValue', property: 'someValue2' } },
            { Matcher: {} },
          ],
          partition2: [],
        },
        depth: 1,
      },
    ];

    rulesToCheck.forEach(({ expected, partition, rules, depth }) => {
      it('should add partition', () => {
        const result = RulesService.addPartition(partition, rules, depth);
        assert.deepEqual(result, expected);
      });
    });
  });

  describe('convertToExplicitRules', () => {
    const rulesToCheck = [
      {
        expected: [toExplicitRule('someValue')],
        rule: 'someValue',
        depth: 0,
      },
      {
        expected: [toExplicitRule('someValue')],
        rule: [toExplicitRule('someValue')],
        depth: 0,
      },
      {
        expected: { '*': [toExplicitRule('someValue')] },
        rule: 'someValue',
        depth: 1,
      },
      {
        expected: { '*': [toExplicitRule('someValue')] },
        rule: [toExplicitRule('someValue')],
        depth: 1,
      },
      {
        expected: {
          somePartition1: [toExplicitRule('someValue1')],
          somePartition2: [toExplicitRule('someValue2')],
        },
        rule: {
          somePartition1: 'someValue1',
          somePartition2: [toExplicitRule('someValue2')],
        },
        depth: 1,
      },
      {
        expected: { '*': { '*': [toExplicitRule('someValue')] } },
        rule: 'someValue',
        depth: 2,
      },
      {
        expected: { '*': { '*': [toExplicitRule('someValue')] } },
        rule: [toExplicitRule('someValue')],
        depth: 2,
      },
      {
        expected: {
          somePartition1: { '*': [toExplicitRule('someValue1')] },
          somePartition2: { '*': [toExplicitRule('someValue2')] },
          somePartition3: {
            innerPartition1: [toExplicitRule('someValue3')],
            innerPartition2: [toExplicitRule('someValue4')],
          },
        },
        rule: {
          somePartition1: 'someValue1',
          somePartition2: [toExplicitRule('someValue2')],
          somePartition3: {
            innerPartition1: 'someValue3',
            innerPartition2: [toExplicitRule('someValue4')],
          },
        },
        depth: 2,
      },
    ];

    rulesToCheck.forEach(({ expected, rule, depth }) => {
      it('should convert to explicit', () => {
        const result = RulesService.convertToExplicitRules(rule, depth);
        assert.deepEqual(result, expected);
      });
    });
  });

  describe('convertToExplicitKey', () => {
    it('should convert to explicit key', () => {
      const key = {
        partitions: ['p1', 'p2'],
        rules: {
          somePartition1: 'someValue1',
          somePartition2: [toExplicitRule('someValue2')],
          somePartition3: { innerPartition: 'someValue3' },
          somePartition4: { innerPartition: [toExplicitRule('someValue4')] },
        },
        valueType: 'someType',
      };
      const expected = {
        partitions: ['p1', 'p2'],
        rules: {
          somePartition1: { '*': [toExplicitRule('someValue1')] },
          somePartition2: { '*': [toExplicitRule('someValue2')] },
          somePartition3: { innerPartition: [toExplicitRule('someValue3')] },
          somePartition4: { innerPartition: [toExplicitRule('someValue4')] },
        },
        valueType: 'someType',
      };
      const result = RulesService.convertToExplicitKey(key);
      assert.deepEqual(result, expected);
    });
  });
});

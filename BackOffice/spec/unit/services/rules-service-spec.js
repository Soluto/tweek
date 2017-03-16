/* global jest, before, beforeEach, describe, it, expect */
jest.unmock('../../../modules/services/rules-service');

import * as RulesService from '../../../modules/services/rules-service';
import {assert, expect} from 'chai';

const fakeId = 'someId';
const idGenerator = {
  guid: () => fakeId
};
const toExplicitRule = (Value) => ({
  Id: fakeId,
  Matcher: {},
  Value,
  Type: "SingleVariant"

});

describe('rules-service', () => {
  describe('addPartition', () => {
    const partition = "somePartition";

    const rulesToCheck = [
      {expected: {'*': []}, partition, rules: [], depth: 0},
      {
        expected: {
          someValue1: [{Matcher: {}}],
          someValue2: [
            {Matcher: {}},
            {Matcher: {property: 'someValue'}}
          ],
          '*': [{Matcher: {}}]
        },
        partition,
        rules: [
          {Matcher: {[partition]: 'someValue1'}},
          {Matcher: {[partition]: 'someValue2'}},
          {Matcher: {[partition]: 'someValue2', property: 'someValue'}},
          {Matcher: {}}
        ],
        depth: 0
      },
      {
        expected: {
          partition1: {
            someValue: [
              {Matcher: {}},
              {Matcher: {property: 'someValue2'}}
            ],
            '*': [{Matcher: {}}]
          },
          partition2: {'*': []}
        },
        partition,
        rules: {
          partition1: [
            {Matcher: {[partition]: 'someValue'}},
            {Matcher: {[partition]: 'someValue', property: 'someValue2'}},
            {Matcher: {}}
          ],
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
        expected: [toExplicitRule("someValue")],
        rule: "someValue",
        depth: 0
      },
      {
        expected: [toExplicitRule("someValue")],
        rule: [toExplicitRule("someValue")],
        depth: 0
      },
      {
        expected: {'*': [toExplicitRule("someValue")]},
        rule: "someValue",
        depth: 1
      },
      {
        expected: {'*': [toExplicitRule("someValue")]},
        rule: [toExplicitRule("someValue")],
        depth: 1
      },
      {
        expected: {
          somePartition1: [toExplicitRule("someValue1")],
          somePartition2: [toExplicitRule("someValue2")]
        },
        rule: {
          somePartition1: "someValue1",
          somePartition2: [toExplicitRule("someValue2")]
        },
        depth: 1
      },
      {
        expected: {'*': {'*': [toExplicitRule("someValue")]}},
        rule: "someValue",
        depth: 2
      },
      {
        expected: {'*': {'*': [toExplicitRule("someValue")]}},
        rule: [toExplicitRule("someValue")],
        depth: 2
      },
      {
        expected: {
          somePartition1: {'*': [toExplicitRule("someValue1")]},
          somePartition2: {'*': [toExplicitRule("someValue2")]},
          somePartition3: {
            innerPartition1: [toExplicitRule("someValue3")],
            innerPartition2: [toExplicitRule("someValue4")]
          },
        },
        rule: {
          somePartition1: "someValue1",
          somePartition2: [toExplicitRule("someValue2")],
          somePartition3: {
            innerPartition1: "someValue3",
            innerPartition2: [toExplicitRule("someValue4")]
          },
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
    it('should convert to explicit key', () => {
      const key = {
        partitions: ['p1', 'p2'],
        rules: {
          somePartition1: "someValue1",
          somePartition2: [toExplicitRule("someValue2")],
          somePartition3: {innerPartition: "someValue3"},
          somePartition4: {innerPartition: [toExplicitRule("someValue4")]}
        },
        valueType: 'someType'
      };
      const expected = {
        partitions: ['p1', 'p2'],
        rules: {
          somePartition1: {'*': [toExplicitRule("someValue1")]},
          somePartition2: {'*': [toExplicitRule("someValue2")]},
          somePartition3: {innerPartition: [toExplicitRule("someValue3")]},
          somePartition4: {innerPartition: [toExplicitRule("someValue4")]}
        },
        valueType: 'someType'
      };
      const result = RulesService.convertToExplicitKey(key, idGenerator);
      assert.deepEqual(result, expected);
    });
  });
});

import * as R from 'ramda';
import { ValueType } from 'tweek-client';
import { KEYS_IDENTITY } from '../../services/context-service';
import { safeConvertValue } from '../../services/types-service';
import { SliderItem } from '../common/CustomSlider/CustomSlider';
import { Jpad, JpadRules, Matcher, Partition, Rule, WeightedDistributionArg } from './types';

export type AuthPartitionTest = {
  isValid: boolean;
  match: number;
  default: number;
};

export function testAutoPartition(
  partition: string,
  rules: JpadRules,
  depth: number,
): AuthPartitionTest {
  if (depth === 0) {
    const rulesList = rules as Rule[];
    const matchers = rulesList.map((r) => r.Matcher[partition]).filter((p) => p !== undefined);
    const isValid = matchers.every(
      (p) => typeof p === 'string' || Object.keys(p).every((k) => k === '$eq'),
    );
    if (!isValid) return { isValid, match: 0, default: 0 };

    const match = matchers.length;
    return {
      isValid,
      match,
      default: rulesList.length - match,
    };
  }

  return R.reduceWhile(
    (result) => result.isValid,
    (result, key) => {
      const test = testAutoPartition(partition, (rules as Partition)[key], depth - 1);
      return {
        isValid: test.isValid,
        match: test.match + result.match,
        default: test.default + result.default,
      };
    },
    { isValid: true, match: 0, default: 0 } as AuthPartitionTest,
    Object.keys(rules),
  );
}

export function addPartition(partition: string, rules: JpadRules, depth: number): Partition {
  if (depth === 0) {
    if (rules.length === 0) return { '*': [] };

    const partitions = R.groupBy(
      (rule) => (rule.Matcher[partition] as string) || '*',
      rules as Rule[],
    );

    Object.values(partitions).forEach((rules) => {
      rules.forEach((r) => {
        const { [partition]: _, ...matcher } = r.Matcher;
        r.Matcher = matcher;
      });
    });

    return partitions;
  }

  return Object.keys(rules).reduce(
    (result, key) => ({
      ...result,
      [key]: addPartition(partition, (rules as Partition)[key], depth - 1),
    }),
    {},
  );
}

export function convertToExplicitRules(rules: string | JpadRules, depth: number): JpadRules {
  let fixedRules = rules as JpadRules;

  if (typeof rules === 'string') {
    fixedRules = [
      {
        Matcher: {},
        Value: rules,
        Type: 'SingleVariant',
      },
    ] as Rule[];
  }

  if (Array.isArray(fixedRules) || depth === 0) {
    for (let i = 0; i < depth; i++) {
      fixedRules = { '*': fixedRules };
    }
    return fixedRules;
  }

  return Object.keys(rules).reduce(
    (result, key) => ({
      ...result,
      [key]: convertToExplicitRules((rules as Partition)[key], depth - 1),
    }),
    {},
  );
}

export function convertToExplicitKey(key: Jpad): Jpad {
  return {
    ...key,
    rules: convertToExplicitRules(key.rules, key.partitions.length),
  };
}

function calculateDependenciesForMatcher(matcher: Matcher) {
  return Object.keys(matcher)
    .map((x) => x.toLowerCase())
    .map((x) => x.replace(/^@@key:/, KEYS_IDENTITY))
    .filter((x) => x.startsWith(KEYS_IDENTITY))
    .map((x) => x.substring(KEYS_IDENTITY.length));
}

function calculateDependencies(rules: JpadRules, depth: number): string[] {
  if (depth === 0) {
    return R.chain(
      calculateDependenciesForMatcher,
      (rules as Rule[]).filter((r) => r.Matcher).map((r) => r.Matcher),
    );
  }

  return R.values(rules as Partition).reduce(
    (result: string[], rule) => result.concat(calculateDependencies(rule, depth - 1)),
    [],
  );
}

export function getDependencies(...args: Parameters<typeof calculateDependencies>) {
  return R.uniq(calculateDependencies(...args)).filter((x) => x.length > 0);
}

export function convertWeightedArgsToArray(
  data: WeightedDistributionArg[] | Record<string, number>,
  valueType: ValueType,
): SliderItem[] {
  if (Array.isArray(data)) return data;
  return Object.entries(data).map(([value, weight]) => ({
    value: safeConvertValue(value, valueType),
    weight,
  }));
}

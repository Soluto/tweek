import R from 'ramda';
import Chance from 'chance';
const chance = new Chance();

export function testAutoPartition(partition, rules, depth) {
  if (depth === 0) {
    const matchers = rules.map(r => r.Matcher[partition]).filter(p => p !== undefined);
    const isValid = matchers.every(p => typeof p === 'string' || Object.keys(p).every(k => k === '$eq'));
    if (!isValid) return {isValid};

    const match = matchers.length;
    return {
      isValid,
      match,
      default: rules.length - match,
    };
  }

  return R.reduceWhile(
    result => result.isValid,
    (result, key) => {
      const test = testAutoPartition(partition, rules[key], depth - 1);
      return {
        isValid: test.isValid,
        match: test.match + result.match,
        default: test.default + result.default
      };
    },
    {isValid: true, match: 0, default: 0},
    Object.keys(rules));
}

export function addPartition(partition, rules, depth) {
  if (depth === 0) {
    if (rules.length === 0) return {'*' : []};

    const byPartition = R.groupBy((rule) => rule.Matcher[partition] || '*');
    const partitioned = byPartition(rules);
    Object.keys(partitioned).forEach(key => {
      partitioned[key].forEach(rule => {
        delete rule.Matcher[partition];
      })
    });
    return partitioned;
  }

  return Object.keys(rules).reduce((result, key) => ({
    ...result,
    [key]: addPartition(partition, rules[key], depth - 1)
  }), {});
}

export function convertToExplicitKey(key, idGenerator) {
  return {
    ...key,
    rules: convertToExplicitRules(key.rules, key.partitions.length, idGenerator)
  }
}

export function convertToExplicitRules(rules, depth, idGenerator = chance) {
  let fixedRules = rules;

  if (typeof rules === 'string') {
    fixedRules =[{
        Id: idGenerator.guid(),
        Matcher: {},
        Value: rules,
        Type: "SingleVariant"
      }];
  }

  if (Array.isArray(fixedRules) || depth == 0) {
    for (let i = 0; i < depth; i++) {
      fixedRules = {'*': fixedRules};
    }
    return fixedRules;
  }

  return Object.keys(rules).reduce((result, key) => ({
    ...result,
    [key]: convertToExplicitRules(rules[key], depth - 1, idGenerator)
  }), {});
}

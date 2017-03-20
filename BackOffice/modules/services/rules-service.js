import R from 'ramda';
import Chance from 'chance';
const chance = new Chance();

export function addPartition(partition, rules, depth) {
  if (depth == 0) {
    if (rules.length == 0) return {'*' : []};

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

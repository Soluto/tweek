import R from 'ramda';

export function testAutoPartition(partition, rules, depth) {
  if (depth === 0) {
    const matchers = rules.map(r => r.Matcher[partition]).filter(p => p !== undefined);
    const isValid = matchers.every(p => typeof p === 'string' || Object.keys(p).every(k => k === '$eq'));
    if (!isValid) return { isValid };

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
        default: test.default + result.default,
      };
    },
    { isValid: true, match: 0, default: 0 },
    Object.keys(rules));
}

export function addPartition(partition, rules, depth) {
  if (depth === 0) {
    if (rules.length === 0) return { '*': [] };

    const byPartition = R.groupBy(rule => rule.Matcher[partition] || '*');
    const partitioned = byPartition(rules);
    Object.keys(partitioned).forEach((key) => {
      partitioned[key].forEach((rule) => {
        delete rule.Matcher[partition];
      });
    });
    return partitioned;
  }

  return Object.keys(rules).reduce((result, key) => ({
    ...result,
    [key]: addPartition(partition, rules[key], depth - 1),
  }), {});
}

export function convertToExplicitRules(rules, depth) {
  let fixedRules = rules;

  if (typeof rules === 'string') {
    fixedRules = [{
      Matcher: {},
      Value: rules,
      Type: 'SingleVariant',
    }];
  }

  if (Array.isArray(fixedRules) || depth === 0) {
    for (let i = 0; i < depth; i++) {
      fixedRules = { '*': fixedRules };
    }
    return fixedRules;
  }

  return Object.keys(rules).reduce((result, key) => ({
    ...result,
    [key]: convertToExplicitRules(rules[key], depth - 1),
  }), {});
}

export function convertToExplicitKey(key) {
  return {
    ...key,
    rules: convertToExplicitRules(key.rules, key.partitions.length),
  };
}

export const DEPENDENT_KEY_PREFIX = 'keys.';

function calculateDependenciesForMatcher(matcher) {
  return Object.keys(matcher)
    .map(x => x.toLowerCase())
    .map(x => (x.startsWith('@@key:') ? x.replace('@@key:', 'keys.') : x))
    .filter(x => x.startsWith(DEPENDENT_KEY_PREFIX))
    .map(x => x.substring(DEPENDENT_KEY_PREFIX.length));
}

function calculateDependencies(rules, depth) {
  if (depth === 0) {
    return R.chain(
      calculateDependenciesForMatcher,
      rules.filter(r => r.Matcher).map(r => r.Matcher),
    );
  }

  return R.values(rules)
    .reduce((result, rule) => result.concat(calculateDependencies(rule, depth - 1)), []);
}

export function getDependencies(...args) {
  return R.uniq(calculateDependencies(...args)).filter(x => x.length > 0);
}

import R from 'ramda';

export function addPartition(partition, rules, depth) {
  if (depth == 0) {
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

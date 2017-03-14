import React from 'react';
import PartitionsSelector from './Partition/PartitionsSelector';
import RulesList from './RulesList/RulesList';
import PartitionsList from './PartitionsList/PartitionsList';

const isBrowser = typeof (window) === 'object';

function createPartitionedRules(depth) {
  if (depth == 0) return [];
  return {"*": createPartitionedRules(depth - 1)};
}

function isEmptyRules(rules) {
  if (Array.isArray(rules)) return rules.length == 0;
  if (Object.keys(rules).some(k => k != '*')) return false;
  return isEmptyRules(rules['*']);
}

export default ({valueType, mutate}) => {
  if (!isBrowser)
    return (<div>Loading rule...</div>);

  const partitions = mutate.in("partitions").getValue();

  const updatePartitions = newPartitions => {
    if (!isEmptyRules(mutate.in("rules").getValue()) && !confirm("If you change the partitions the rules will be reset.\nDo you want to continue?")) return;
    mutate.apply(m => m.insert("partitions", newPartitions).insert("rules", createPartitionedRules(newPartitions.length)));
  };

  return (
    <div>
      <PartitionsSelector
        partitions={partitions}
        onPartitionsChange={updatePartitions}
      />

      {
        partitions && partitions.length > 0
          ? <PartitionsList partitions={partitions} valueType={valueType} mutate={mutate.in("rules")}/>
          : <RulesList valueType={valueType} mutate={mutate.in("rules")}/>
      }
    </div>
  );
}
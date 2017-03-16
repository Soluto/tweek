import React from 'react';
import R from 'ramda';
import PartitionsSelector from './Partition/PartitionsSelector';
import RulesList from './RulesList/RulesList';
import PartitionsList from './PartitionsList/PartitionsList';
import * as RulesService from '../../../../../../../services/rules-service';

const isBrowser = typeof (window) === 'object';

function createPartitionedRules(depth) {
  if (depth == 0) return [];
  return {"*": createPartitionedRules(depth - 1)};
}

function isEmptyRules(rules) {
  if (!rules) return true;
  if (Array.isArray(rules)) return rules.length == 0;
  if (Object.keys(rules).some(k => k != '*')) return false;
  return isEmptyRules(rules['*']);
}

export default ({valueType, mutate}) => {
  if (!isBrowser)
    return (<div>Loading rule...</div>);

  const partitions = mutate.in("partitions").getValue();

  const handlePartitionAddition = (newPartition) => {
    const rules = mutate.in("rules").getValue();
    if (!isEmptyRules(rules) && !confirm("This operation will partition all the rules.\nDo you want to continue?")) return;
    mutate.apply(m => m.insert("rules", RulesService.addPartition(newPartition, rules, partitions.length)).in("partitions").append(newPartition).up());
  };
  const handlePartitionDelete = (index) => {
    if (!isEmptyRules(mutate.in("rules").getValue()) && !confirm("If you change the partitions the rules will be reset.\nDo you want to continue?")) return;
    const newPartitions = R.remove(index, 1, partitions);
    mutate.apply(m => m.insert("partitions", newPartitions).insert("rules", createPartitionedRules(newPartitions.length)));
  };

  return (
    <div>
      <PartitionsSelector
        partitions={partitions}
        handlePartitionAddition={handlePartitionAddition}
        handlePartitionDelete={handlePartitionDelete}
      />

      {
        partitions && partitions.length > 0
          ? <PartitionsList partitions={partitions} valueType={valueType} mutate={mutate.in("rules")}/>
          : <RulesList valueType={valueType} mutate={mutate.in("rules")}/>
      }
    </div>
  );
}
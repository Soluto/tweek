import React from 'react';
import PartitionsSelector from './Partition/PartitionsSelector';
import RulesList from './RulesList/RulesList';
import PartitionsList from './PartitionsList/PartitionsList';

const isBrowser = typeof (window) === 'object';

export default ({valueType, mutate}) => {
  if (!isBrowser)
    return (<div>Loading rule...</div>);

  const partitions = mutate.in("partitions").getValue();

  const updatePartitions = newPartitions => {
    if (!confirm("If you change the partitions the rules will be reset.\nDo you want to continue?")) return;
    mutate.apply(m => m.insert("partitions", newPartitions).insert("rules", newPartitions.length > 0 ? {"*": []} : []));
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
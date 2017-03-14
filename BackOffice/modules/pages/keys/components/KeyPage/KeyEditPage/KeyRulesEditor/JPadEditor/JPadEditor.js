import React from 'react';
import RulesList from './RulesList/RulesList';
import PartitionsList from './PartitionsList/PartitionsList';

const isBrowser = typeof (window) === 'object';

export default ({valueType, mutate}) => {
  if (!isBrowser)
    return (<div>Loading rule...</div>);

  const partitions = mutate.in('partitions').getValue();

  if (partitions && partitions.length > 0)
    return <PartitionsList partitions={partitions} valueType={valueType} mutate={mutate.in("rules")} />;

  return (<RulesList valueType={valueType} mutate={mutate.in("rules")}/>)
}
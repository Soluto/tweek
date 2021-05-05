import * as R from 'ramda';
import React from 'react';
import '../../../../styles/core/core.css';
import NewPartition from './NewPartition';
import PartitionItem from './PartitionItem';
import './PartitionsList.css';

const extractPartitionToObject = (mutate, partitions) => {
  if (partitions.length === 0) {
    return [{ mutate }];
  }

  return R.flatten(
    Object.keys(mutate.getValue()).map((partitionValue) => {
      const innerResults = extractPartitionToObject(mutate.in(partitionValue), partitions.slice(1));
      return innerResults.map((innerResult) => ({
        [partitions[0]]: partitionValue,
        ...innerResult,
      }));
    }),
  );
};

const sortPartitions = (partitions) =>
  R.sortWith(partitions.map((_, i) => R.descend(R.pipe(R.prop('partitionsValues'), R.prop(i)))));

const deletePartitionGroupAlert = {
  title: 'Are you sure?',
  message:
    'This operation will delete the partition group along with all the rules inside it.\nDo you want to continue?',
};

const PartitionsList = ({ partitions, mutate, valueType, alerter }) => {
  const rulesByPartitions = mutate.getValue();
  if (!rulesByPartitions) {
    return <div />;
  }

  const addPartition = ({ partition: newPartition, defaultValue }) => {
    console.log({ newPartition, defaultValue });

    const partitionDefaultValue =
      defaultValue === '' ? [] : [{ Type: 'SingleVariant', Matcher: {}, Value: defaultValue }];
    mutate.apply((m) => {
      partitions.forEach((partition, i) => {
        const partitionValue = newPartition[partition] || '*';
        if (!m.getValue()[partitionValue]) {
          m.insert(partitionValue, i === partitions.length - 1 ? partitionDefaultValue : {});
        }
        m = m.in(partitionValue);
      });

      return m;
    });
  };

  const deletePartition = async (partitionGroup) => {
    if ((await alerter.showConfirm(deletePartitionGroupAlert)).result) {
      mutate.apply((partitionMutate) => {
        for (const partition of partitionGroup) {
          partitionMutate = partitionMutate.in(partition);
        }

        let i = partitionGroup.length;
        do {
          partitionMutate.delete();
          partitionMutate = partitionMutate.up();
        } while (--i && Object.keys(partitionMutate.getValue()).length === 0);

        return partitionMutate;
      });
    }
  };

  let partitionsData = extractPartitionToObject(mutate, partitions);

  partitionsData = partitionsData.map((x, i) => ({
    ...x,
    valueType,
    id: i,
    partitionsValues: partitions.map((partitionName) => x[partitionName]),
  }));

  partitionsData = sortPartitions(partitions)(partitionsData);

  const hasDefaultValue = Object.keys(rulesByPartitions).includes('*');

  return (
    <div className="partitions-list-container">
      {!hasDefaultValue && (
        <button className="add-default-partition-button" onClick={() => addPartition({})}>
          Add default partition
        </button>
      )}

      <NewPartition
        partitions={partitions}
        handlePartitionAddition={addPartition}
        valueType={valueType}
      />

      <div className="partitions-accordion-container">
        {partitionsData.map((partitionData) => (
          <PartitionItem
            valueType={valueType}
            onDelete={() => deletePartition(partitionData.partitionsValues)}
            partitionsValues={partitionData.partitionsValues}
            mutate={partitionData.mutate}
            alerter={alerter}
          />
        ))}
      </div>
    </div>
  );
};

export default PartitionsList;

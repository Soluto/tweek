import * as R from 'ramda';
import React from 'react';
import { ValueType } from 'tweek-client';
import '../../../../styles/core/core.css';
import { AnyMutator } from '../../../../utils/mutator';
import { Alerter } from '../../../alerts/types';
import { ConditionValueType, JpadRules, Partition, Rule } from '../../types';
import NewPartition, { NewPartitionData } from './NewPartition';
import PartitionItem from './PartitionItem';
import './PartitionsList.css';

export type PartitionData = {
  partitionsValues: string[];
  mutate: AnyMutator<Rule[]>;
};

type PartitionObj = Record<string, string> & {
  mutate: AnyMutator<Rule[]>;
};

const extractPartitionToObject = (
  mutate: AnyMutator<JpadRules>,
  partitions: string[],
): PartitionObj[] => {
  if (partitions.length === 0) {
    return [{ mutate } as PartitionObj];
  }

  return R.flatten(
    Object.keys(mutate.getValue()).map((partitionValue) => {
      const innerResults = extractPartitionToObject(
        (mutate.in(partitionValue) as unknown) as AnyMutator<JpadRules>,
        partitions.slice(1),
      );
      return innerResults.map((innerResult) => ({
        [partitions[0]]: partitionValue,
        ...innerResult,
      }));
    }),
  );
};

const sortPartitions = (partitions: string[]): ((x: PartitionData[]) => PartitionData[]) =>
  R.sortWith(partitions.map((_, i) => R.descend((p: PartitionData) => p.partitionsValues[i])));

const deletePartitionGroupAlert = {
  title: 'Are you sure?',
  message:
    'This operation will delete the partition group along with all the rules inside it.\nDo you want to continue?',
};

export type PartitionsListProps = {
  partitions: string[];
  mutate: AnyMutator<Partition>;
  valueType: ValueType;
  alerter: Alerter;
};

const PartitionsList = ({ partitions, mutate, valueType, alerter }: PartitionsListProps) => {
  const rulesByPartitions = mutate.getValue();
  if (!rulesByPartitions) {
    return <div />;
  }

  const addPartition = ({
    partition: newPartition = {},
    defaultValue,
  }: Partial<NewPartitionData>) => {
    const partitionDefaultValue: Rule[] =
      defaultValue === ''
        ? []
        : [{ Type: ConditionValueType.SingleVariant, Matcher: {}, Value: defaultValue }];

    mutate.apply((m) => {
      partitions.forEach((partition, i) => {
        const partitionValue = newPartition[partition] || '*';
        if (!m.getValue()[partitionValue]) {
          m.insert(partitionValue, i === partitions.length - 1 ? partitionDefaultValue : {});
        }
        m = m.in(partitionValue) as any;
      });

      return m;
    });
  };

  const deletePartition = async (partitionGroup: string[]) => {
    if ((await alerter.showConfirm(deletePartitionGroupAlert)).result) {
      mutate.apply((partitionMutate) => {
        for (const partition of partitionGroup) {
          partitionMutate = partitionMutate.in(partition) as any;
        }

        let i = partitionGroup.length;
        do {
          partitionMutate.delete();
          partitionMutate = partitionMutate.up() as any;
        } while (--i && Object.keys(partitionMutate.getValue()).length === 0);

        return partitionMutate;
      });
    }
  };

  const mappedPartitions = extractPartitionToObject(mutate as AnyMutator<JpadRules>, partitions);

  let partitionsData = mappedPartitions.map((x) => ({
    mutate: x.mutate,
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

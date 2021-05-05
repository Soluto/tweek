import React, { useState } from 'react';
import { ValueType } from 'tweek-client';
import * as ContextService from '../../../../services/context-service';
import { TypedInput } from '../../../common';
import { InputValue } from '../RuleValue/RuleValue';

type NewPartitionPropertyValueProps = {
  value: any;
  onUpdate?: (value: any) => void;
  name: string;
  identity?: string;
  id: string;
};

const NewPartitionPropertyValue = ({
  value,
  onUpdate,
  name,
  identity = 'unknown',
  id: property,
}: NewPartitionPropertyValueProps) => (
  <TypedInput
    value={value}
    onChange={onUpdate}
    placeholder={`${name} (${identity})`}
    valueType={ContextService.getPropertyTypeDetails(property)}
    data-field={`${identity}.${name}`}
  />
);

export type NewPartitionData = {
  partition: Record<string, any>;
  defaultValue: any;
};

const EMPTY_STATE: NewPartitionData = { partition: {}, defaultValue: '' };

export type NewPartitionProps = {
  partitions: string[];
  valueType: ValueType;
  handlePartitionAddition: (state: NewPartitionData) => void;
};

const NewPartition = ({ partitions, valueType, handlePartitionAddition }: NewPartitionProps) => {
  const [state, setState] = useState(EMPTY_STATE);

  const addPartition = () => {
    handlePartitionAddition && handlePartitionAddition(state);
    setState(EMPTY_STATE);
  };

  const allProperties = ContextService.getSchemaProperties();
  const indexedPartitions = partitions.map(
    (partition) =>
      allProperties.find((property) => property.id === partition) || {
        id: partition,
        name: partition,
      },
  );

  return (
    <div className="new-partition-container" data-comp="new-partition">
      {indexedPartitions.map((partition) => (
        <div className="new-partition-item-container" key={partition.id}>
          <NewPartitionPropertyValue
            {...partition}
            value={state.partition[partition.id] || ''}
            onUpdate={(value) =>
              setState((s) => ({ ...s, partition: { ...s.partition, [partition.id]: value } }))
            }
          />
        </div>
      ))}
      <InputValue
        value={state.defaultValue}
        valueType={valueType}
        onChange={(defaultValue) => setState((s) => ({ ...s, defaultValue }))}
        placeholder="Partition's default value"
      />
      <button className="add-partition-button" data-comp="add-partition" onClick={addPartition} />
    </div>
  );
};

export default NewPartition;

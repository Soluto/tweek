import React from 'react';
import R from 'ramda';
import PropertyComboBox from '../Matcher/Properties/PropertyComboBox';
import * as ContextService from '../../../../../../../../services/context-service';

export default ({partitions, onPartitionsChange}) => {
  if (partitions.length > 1){
    return (
      <div>
        <label>Partition by:</label>
        <div>
          {
            partitions.join(", ")
          }
        </div>
      </div>
    );
  }

  const suggestedValues = ContextService.getProperties().map(prop => ({ label: prop.name, value: prop.id }));

  const selectPartition = (newProperty) => {
    const newPartitions = [newProperty.value];
    if (!R.equals(partitions, newPartitions) && onPartitionsChange) {
      onPartitionsChange(newPartitions);
    }
  };

  return (
    <div>
      <label>Partition by:</label>
      <PropertyComboBox
        suggestedValues={suggestedValues}
        property={partitions[0]}
        onPropertyChange={selectPartition}
      />
    </div>
  );
};

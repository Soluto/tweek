import React from 'react';
import { Tag, WithContext as ReactTags } from 'react-tag-input';
import { useAlerter } from '../../../../contexts/Alerts';
import { useSchemaProperties } from '../../../../contexts/Schema/Schemas';
import './PartitionsSelector.css';

export type PartitionSelectorProps = {
  partitions: string[];
  handlePartitionAddition: (partition: string) => void;
  handlePartitionDelete: (index: number) => void;
};

const PartitionSelector = ({
  partitions,
  handlePartitionAddition,
  handlePartitionDelete,
}: PartitionSelectorProps) => {
  const alerter = useAlerter();

  const allProperties = useSchemaProperties().map((x) => ({
    id: x.id,
    text: `${x.name} (${x.identity})`,
  }));

  const indexedSuggestions = allProperties.filter((property) => !partitions.includes(property.id));

  const indexedTags = partitions.map(
    (partition) =>
      allProperties.find((property) => property.id === partition) || {
        id: partition,
        text: partition,
      },
  );

  const handleAddition = (newValue: Tag) => {
    const newId = newValue.id.toLowerCase();

    let newProperty = allProperties.find((x) => x.id.toLowerCase() === newId);
    if (!newProperty) {
      newProperty = allProperties.find((x) => x.text.toLowerCase() === newValue.text.toLowerCase());
    }

    if (!newProperty) {
      alerter.showAlert({
        title: 'Attention!',
        message: `Can't partition by '${newValue.text}'`,
      });
    } else if (partitions.includes(newProperty.id)) {
      alerter.showAlert({
        title: 'Attention!',
        message: `Property '${newProperty.text}' already exists in partitions list`,
      });
    } else {
      handlePartitionAddition(newProperty.id);
    }
  };

  return (
    <div className="partitions-selector-container" data-comp="partition-selector">
      <label className="partitions-label">Partition by:</label>
      <div className="partition-tags-wrapper">
        <ReactTags
          tags={indexedTags}
          suggestions={indexedSuggestions}
          handleAddition={handleAddition}
          handleDelete={handlePartitionDelete}
          placeholder={partitions.length === 0 ? 'Add partition' : ''}
          minQueryLength={1}
          allowDeleteFromEmptyInput
          autocomplete
          allowUnique={false}
          allowDragDrop={false}
          classNames={{
            tags: 'tags-container',
            tagInput: 'tag-input',
            tag: 'tag',
            remove: 'tag-delete-button',
            suggestions: 'tags-suggestion',
          }}
        />
      </div>
    </div>
  );
};

export default PartitionSelector;

import React from 'react';
import { WithContext as ReactTags } from 'react-tag-input';
import * as ContextService from '../../../../services/context-service';
import './PartitionsSelector.css';

export default ({ partitions, handlePartitionAddition, handlePartitionDelete, alerter }) => {
  const allProperties = ContextService.getProperties().map(x => ({
    id: x.id,
    text: `${x.name} (${x.identity})`,
  }));
  const indexedSuggestions = allProperties
    .filter(property => !partitions.includes(property.id))
    .map(x => x.text);
  const indexedTags = partitions.map(
    partition =>
      allProperties.find(property => property.id === partition) || {
        id: partition,
        text: partition,
      },
  );

  const handleAddition = (newValue) => {
    const newProperty = allProperties.find(x => x.text === newValue || x.id === newValue);
    if (!newProperty) {
      alerter.showAlert({
        title: 'Attention!',
        message: `Can't partition by '${newValue}'`,
      });
    } else if (!partitions.includes(newProperty.id)) {
      handlePartitionAddition(newProperty.id);
    } else {
      alerter.showAlert({
        title: 'Attention!',
        message: `Property '${newProperty.text}' already exists in partitions list`,
      });
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

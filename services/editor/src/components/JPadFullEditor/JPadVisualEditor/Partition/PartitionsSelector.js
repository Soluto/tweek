import React from 'react';
import { WithContext as ReactTags } from 'react-tag-input';
import { compose, withHandlers, withProps } from 'recompose';
import * as ContextService from '../../../../services/context-service';
import './PartitionsSelector.css';

const enhance = compose(
  withProps(({ partitions }) => {
    const allProperties = ContextService.getSchemaProperties().map((x) => ({
      id: x.id,
      text: `${x.name} (${x.identity})`,
    }));
    return {
      allProperties,
      indexedSuggestions: allProperties.filter((property) => !partitions.includes(property.id)),
      indexedTags: partitions.map(
        (partition) =>
          allProperties.find((property) => property.id === partition) || {
            id: partition,
            text: partition,
          },
      ),
    };
  }),
  withHandlers({
    handleAddition: ({
      allProperties,
      partitions,
      handlePartitionAddition,
      handlePartitionDelete,
      alerter,
    }) => (newValue) => {
      const newId = newValue.id.toLowerCase();

      let newProperty = allProperties.find((x) => x.id.toLowerCase() === newId);
      if (!newProperty) {
        newProperty = allProperties.find(
          (x) => x.text.toLowerCase() === newValue.text.toLowerCase(),
        );
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
    },
  }),
);

const PartitionSelector = ({
  indexedSuggestions,
  indexedTags,
  handleAddition,
  partitions,
  handlePartitionDelete,
}) => {
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

export default enhance(PartitionSelector);

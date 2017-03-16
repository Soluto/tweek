import React from 'react';
import { WithContext as ReactTags } from 'react-tag-input';
import * as ContextService from '../../../../../../../../services/context-service';
import style from './PartitionsSelector.css';

export default ({partitions, handlePartitionAddition, handlePartitionDelete}) => {
  const allProperties = ContextService.getProperties().map(x => ({ id: x.id, text: `${x.name} (${x.identity})` }));
  const indexedSuggestions = allProperties.filter(property => !partitions.includes(property.id)).map(x => x.text);
  const indexedTags = partitions.map(partition => allProperties.find(property => property.id == partition) || {id: partition, text: partition});

  const handleAddition = (newValue) => {
    const newProperty = allProperties.find(x => x.text === newValue || x.id === newValue);
    if (!newProperty) {
      alert(`Can't partition by ${newValue}`);
    } else if (!partitions.includes(newProperty.id)) {
      handlePartitionAddition(newProperty.id);
    } else {
      alert(`Property "${newProperty.text}" already exists in partitions list`);
    }
  };

  return (
    <div className={style['partitions-selector-container']}>
      <label className={style['partitions-label']}>Partition by:</label>
      <div className={style['tags-wrapper']}>
        <ReactTags tags={indexedTags}
                   suggestions={indexedSuggestions}
                   handleAddition={handleAddition}
                   handleDelete={handlePartitionDelete}
                   placeholder="Add partition"
                   minQueryLength={1}
                   allowDeleteFromEmptyInput={true}
                   autocomplete={true}
                   classNames={{
                     tags: style['tags-container'],
                     tagInput: style['tag-input'],
                     tag: style['tag'],
                     remove: style['tag-delete-button'],
                     suggestions: style['tags-suggestion'],
                   }}
        />
      </div>
    </div>
  );
};

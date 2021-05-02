import * as R from 'ramda';
import React from 'react';
import { connect } from 'react-redux';
import { WithContext as ReactTags } from 'react-tag-input';
import * as tagActions from '../../../../../../store/ducks/tags';
import './KeyTags.css';

const enhance = connect((state) => ({ globalTags: state.tags }), tagActions);

const KeyTags = ({
  globalTags,
  tags: originalTags,
  onTagsChanged,
  saveNewTag,
  navigateToTagResults,
}) => {
  const tags = originalTags.map((x) => ({
    id: x.toLowerCase(),
    text: x,
  }));
  const tagsSuggestions = Object.entries(globalTags).map(([id, text]) => ({ id, text }));

  const onTagAdded = ({ text }) => {
    const newTag = { id: text.toLowerCase(), text };

    if (tags.some((t) => t.id === newTag.id)) {
      return;
    }

    onTagsChanged([...tags.map((t) => t.text), text]);
    saveNewTag(newTag);
  };

  const onTagDeleted = (deletedTagIndex) => {
    const newTags = R.remove(deletedTagIndex, 1, this.props.tags);
    onTagsChanged(newTags.map((x) => x.text));
  };

  return (
    <div className="key-tags" data-comp="key-tags">
      <ReactTags
        tags={tags}
        handleDelete={onTagDeleted}
        handleAddition={onTagAdded}
        suggestions={tagsSuggestions}
        placeholder="New tag"
        allowDragDrop={false}
        handleTagClick={(i) => navigateToTagResults(tags[i].text)}
        autofocus={false}
        allowDeleteFromEmptyInput
        minQueryLength={1}
        classNames={{
          tags: 'tags-container',
          tagInput: 'tag-input',
          tag: 'tag',
          remove: 'tag-delete-button',
          suggestions: 'tags-suggestion',
        }}
      />
    </div>
  );
};

export default enhance(KeyTags);

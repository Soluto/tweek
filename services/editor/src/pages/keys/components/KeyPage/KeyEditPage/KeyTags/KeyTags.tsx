import * as R from 'ramda';
import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import { Tag, WithContext as ReactTags } from 'react-tag-input';
import { saveNewTag } from '../../../../../../store/ducks/tags';
import './KeyTags.css';
import { StoreState } from '../../../../../../store/ducks/types';
import { getTagLink } from '../../../../utils/search';

export type Actions = {
  saveNewTag: (tag: Tag) => void;
};

export type StateProps = {
  globalTags: StoreState['tags'];
};

const enhance = connect<StateProps, Actions, {}, StoreState>(
  (state: StoreState) => ({ globalTags: state.tags }),
  { saveNewTag },
);

export type KeyTagsProps = StateProps &
  Actions & {
    tags: string[];
    onTagsChanged: (tags: string[]) => void;
  };

const KeyTags = ({ globalTags, tags: originalTags, onTagsChanged, saveNewTag }: KeyTagsProps) => {
  const history = useHistory();

  const tags = originalTags.map((x) => ({
    id: x.toLowerCase(),
    text: x,
  }));
  const tagsSuggestions = Object.entries(globalTags).map(([id, text]) => ({ id, text }));

  const onTagAdded = ({ text }: Tag) => {
    const newTag = { id: text.toLowerCase(), text };

    if (tags.some((t) => t.id === newTag.id)) {
      return;
    }

    onTagsChanged([...tags.map((t) => t.text), text]);
    saveNewTag(newTag);
  };

  const onTagDeleted = (deletedTagIndex: number) => {
    const newTags = R.remove(deletedTagIndex, 1, tags);
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
        handleTagClick={(i) => history.push(getTagLink(tags[i].text))}
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

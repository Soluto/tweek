import * as R from 'ramda';
import React from 'react';
import { useHistory } from 'react-router';
import { Tag, WithContext as ReactTags } from 'react-tag-input';
import { useSaveNewTag, useTags } from '../../../../../../contexts/Tags';
import { getTagLink } from '../../../../utils/search';
import './KeyTags.css';

export type KeyTagsProps = {
  tags: string[];
  onTagsChanged: (tags: string[]) => void;
};

const KeyTags = ({ tags: keyTags, onTagsChanged }: KeyTagsProps) => {
  const history = useHistory();
  const knownTags = useTags();
  const saveNewTag = useSaveNewTag();

  const tags = keyTags.map((x) => ({
    id: x.toLowerCase(),
    text: x,
  }));

  const onTagAdded = ({ text }: Tag) => {
    const newTag = text.toLowerCase();
    if (tags.some((t) => t.id === newTag)) {
      return;
    }

    onTagsChanged([...tags.map((t) => t.text), text]);
    saveNewTag(text);
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
        suggestions={knownTags}
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

export default KeyTags;

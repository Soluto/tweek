import React, { Component } from 'react';
import { compose, mapProps, pure } from 'recompose';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { WithContext as ReactTags } from 'react-tag-input';
import * as tagActions from '../../../../../../store/ducks/tags';
import './KeyTags.css';

export default compose(
  connect(
    (state) => ({ globalTags: state.tags }),
    tagActions,
  ),
  pure,
  mapProps(({ globalTags, tags, ...props }) => ({
    ...props,
    tagsSuggestions: Object.entries(globalTags).map(([id, text]) => ({ id, text })),
    tags: tags.map((x) => ({
      id: x.toLowerCase(),
      text: x,
    })),
  })),
)(
  class KeyTags extends Component {
    _onTagAdded = ({ text }) => {
      const { saveNewTag, tags } = this.props;

      const newTag = { id: text.toLowerCase(), text };

      if (tags.some((t) => t.id === newTag.id)) {
        return;
      }

      this.props.onTagsChanged([...tags.map((t) => t.text), text]);
      saveNewTag(newTag);
    };

    _onTagDeleted = (deletedTagIndex) => {
      const newTags = R.remove(deletedTagIndex, 1, this.props.tags);
      this.props.onTagsChanged(newTags.map((x) => x.text));
    };

    render() {
      const { tags, tagsSuggestions, navigateToTagResults } = this.props;
      return (
        <div className="key-tags" data-comp="key-tags">
          <ReactTags
            tags={tags}
            handleDelete={this._onTagDeleted}
            handleAddition={this._onTagAdded}
            suggestions={tagsSuggestions}
            placeholder="New tag"
            allowDragDrop={false}
            handleTagClick={(i) => navigateToTagResults(tags[i].text)}
            autofocus={false}
            allowDeleteFromEmptyInput
            allowDragDrop={false}
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
    }
  },
);

import React, { Component } from 'react';
import { compose, mapProps, pure } from 'recompose';
import { connect } from 'react-redux';
import R from 'ramda';
import { WithContext as ReactTags } from 'react-tag-input';
import * as tagActions from '../../../../../../store/ducks/tags';
import style from './KeyTags.css';

export default compose(
  connect(state => ({ globalTags: state.tags }), { ...tagActions }),
  pure,
  mapProps(({ globalTags, tags, ...props }) => ({
    ...props,
    tagsSuggestions: globalTags.map(x => x.name),
    tags: tags.map(x => ({
      id: x,
      text: x,
    })),
  })),
)(
  class KeyTags extends Component {
    _onTagAdded = (newTagText) => {
      const { saveNewTags } = this.props;

      const currentTags = this.props.tags.map(x => x.text);
      if (currentTags.indexOf(newTagText) >= 0) {
        return;
      }

      const newTags = [...currentTags, newTagText];
      this.props.onTagsChanged(newTags);

      saveNewTags([newTagText]);
    };

    _onTagDeleted = (deletedTagIndex) => {
      const newTags = R.remove(deletedTagIndex, 1, this.props.tags);
      this.props.onTagsChanged(newTags.map(x => x.text));
    };

    render() {
      const { tags, tagsSuggestions } = this.props;
      return (
        <div className={style['tags-wrapper']}>
          <ReactTags
            tags={tags}
            handleDelete={this._onTagDeleted}
            handleAddition={this._onTagAdded}
            suggestions={tagsSuggestions}
            placeholder="New tag"
            autofocus={false}
            allowDeleteFromEmptyInput
            minQueryLength={1}
            classNames={{
              tags: style['tags-container'],
              tagInput: style['tag-input'],
              tag: style.tag,
              remove: style['tag-delete-button'],
              suggestions: style['tags-suggestion'],
            }}
          />
        </div>
      );
    }
  },
);

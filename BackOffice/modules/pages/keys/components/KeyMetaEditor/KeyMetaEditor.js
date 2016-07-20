import React from 'react';
import { Component } from 'react';
import style from './KeyMetaEditor.css';
import wrapComponentWithClass from '../../../../utils/wrapComponentWithClass';
import R from 'ramda';
import { WithContext as ReactTags } from 'react-tag-input';

class KeyMetaEditor extends Component {
  constructor(props) {
    super(props);
    const { meta, onMetaChangedCallback } = props;

    // TODO: get static collection from PO
    this.tagsSuggestions = ['asdca', 'ssfv', 'gbdfgb', 'dfntyutyu', 'urty', 'mjh', 'qwe', 'ewrwc', 'sdfgs', 'wer', 'bdgb'];
  }

  onDisplayNameChanged(newDisplayName) {
    const { onMetaChangedCallback, meta } = this.props;
    const newMeta = { ...meta, displayName: newDisplayName };
    onMetaChangedCallback(newMeta);
  }

  onDescriptionChanged(newDescription) {
    const { onMetaChangedCallback, meta } = this.props;
    const newMeta = { ...meta, description: newDescription };
    onMetaChangedCallback(newMeta);
  }

  onTagDeleted(deletedTagIndex) {
    const { onMetaChangedCallback, meta } = this.props;
    const newMeta = { ...meta, tags: R.remove(deletedTagIndex - 1, 1, meta.tags) };
    onMetaChangedCallback(newMeta);
  }

  onTagAdded(newTagText) {
    const { onMetaChangedCallback, meta } = this.props;
    const newMeta = { ...meta, tags: [...meta.tags, newTagText] };
    onMetaChangedCallback(newMeta);
  }

  get tags() {
    return R.map(_ => ({
      id: _,
      text: _,
    }), this.props.meta.tags);
  }

  render() {
    return (
      <div>

        <div>
          <span className={ style['meta-data-input-title']}>display name: </span>
          <input type="text"
            className={ style['meta-data-input']}
            onChange={ (e) => this.onDisplayNameChanged(e.target.value) }
            value = { this.props.meta.displayName }
            />
        </div>

        <div>
          <span className={style['meta-data-input-title']}>description name: </span>
          <input type="text"
            className={style['meta-data-input']}
            onChange={ (e) => this.onDescriptionChanged(e.target.value) }
            value = { this.props.meta.description }
            />
        </div>

        <ReactTags tags={ this.tags }
          handleDelete={ this:: this.onTagDeleted }
        handleAddition={ this:: this.onTagAdded }
        suggestions={this.tagsSuggestions }
        placeholder="New tag"
        minQueryLength={ 1 }
        allowDeleteFromEmptyInput={ false }
        classNames={{
          tags: style['tags-container'],
          tagInput: style['tag-input'],
          tag: style['tag'],
          remove: style['tag-delete-button'],
          suggestions: style['tags-suggestion'],
        } }
        />

      </div>
    );
  }
}

export default wrapComponentWithClass(KeyMetaEditor);

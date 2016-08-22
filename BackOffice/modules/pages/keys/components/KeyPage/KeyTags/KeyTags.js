import React from 'react';
import { Component } from 'react';
import { WithContext as ReactTags } from 'react-tag-input';
import { connect } from 'react-redux';
import R from 'ramda';
import style from './KeyTags.css';
import * as tagActions from '../../../ducks/tags';
import * as keysActions from '../../../ducks/selectedKey';

export default connect(state => (
  { selectedKey: state.selectedKey, tags: state.tags }),
  { ...tagActions })(
  class KeyTags extends Component {

    constructor(props) {
      super(props);
    }

    componentDidMount() {
      const { downloadTags } = this.props;
      downloadTags();
    }

    get tags() {
      return R.map(_ => ({
        id: _,
        text: _,
      }), this.props.selectedKey.local.meta.tags);
    }

    get tagsSuggestions() {
      return this.props.tags ? this.props.tags.map(tag => tag.name) : [];
    }

    render() {
      return (

        <ReactTags tags={ this.tags }
          handleDelete={ this.props.onTagDeleted }
          handleAddition={ this.props.onTagAdded }
          suggestions = { this.tagsSuggestions }
          placeholder = "New tag"
          minQueryLength = { 1 }
          allowDeleteFromEmptyInput
          classNames = {{
            tags: style['tags-container'],
            tagInput: style['tag-input'],
            tag: style['tag'],
            remove: style['tag-delete-button'],
            suggestions: style['tags-suggestion'],
          } }
        />

      );
    }
  });

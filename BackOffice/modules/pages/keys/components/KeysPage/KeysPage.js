import React from 'react';
import { Component } from 'react';
import * as actions from '../../ducks/keys';
import { connect } from 'react-redux';
import KeysList from '../KeysList/KeysList';
import { KeyPages as KeyPagesStyle } from './KeysPage.css';
import createFragment from 'react-addons-create-fragment';

export default connect(state => state, { ...actions })(class KeysPage extends Component
{
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (!this.props.keys) {
      this.props.getKeys([]);
    }
  }

  render() {
    return (
            <div className={KeyPagesStyle}>
            {createFragment({
              KeysList: <KeysList keys={this.props.keys}></KeysList>,
              Page: this.props.children,
            })}
            </div>
        );
  }
});

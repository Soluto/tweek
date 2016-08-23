import React from 'react';
import { Component } from 'react';
import * as actions from '../../ducks/keys';
import { connect } from 'react-redux';
import KeysList from '../KeysList/KeysList';
import style from './KeysPage.css';
import createFragment from 'react-addons-create-fragment';
import { withState, compose, mapProps, componentFromStream, createEventHandler } from 'recompose';
import Autosuggest from 'react-autosuggest';
import R from 'ramda';
import { inputKeyboardHandlers } from '../../../../utils/input';

export default connect(state => state, { ...actions })(class KeysPage extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (!this.props.keys) {
      this.props.getKeys([]);
    }
  }

  render() {
    const { keys, addKey, children } = this.props;
    return (
      <div className={style['keys-page-container']}>
        {createFragment({
          KeysList:
          <div className={style['keys-list']}>
            <KeysList className={style['keys-list-wrapper']} keys={keys} />
            <div className={style['add-button-wrapper']}>
              <button className={style['add-button']} onClick={() => addKey() }>Add key</button>
            </div>
          </div>,
          Page: <div className={style['key-page']}>
            {children}
          </div>,
        }) }
      </div>
    );
  }
});

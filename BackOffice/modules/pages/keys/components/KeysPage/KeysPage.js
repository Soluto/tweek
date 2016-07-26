import React from 'react';
import { Component } from 'react';
import * as actions from '../../ducks/keys';
import { connect } from 'react-redux';
import KeysList from '../KeysList/KeysList';
import style from './KeysPage.css';
import createFragment from 'react-addons-create-fragment';

export default connect(state => state, { ...actions })(class KeysPage extends Component {
  constructor(props) {
    super(props);
    console.log(props);
  }

  componentDidMount() {
    if (!this.props.keys) {
      this.props.getKeys([]);
    }
  }

  render() {
    return (
      <div className={style['keys-page-container']}>
        {createFragment({
          KeysList: <div className={style['keys-list']}>
            <KeysList keys={this.props.keys}></KeysList>
          </div>,
          Page: <div className={style['key-page']}>
            {this.props.children}
          </div>,
        }) }
      </div>
    );
  }
});

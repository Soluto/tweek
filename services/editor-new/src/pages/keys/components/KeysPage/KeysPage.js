import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import * as actions from '../../../../store/ducks/keys';
import KeysList from '../KeysList/KeysList';
import style from './KeysPage.css';
import withLoading from '../../../../hoc/with-loading';
import { refreshTypes } from '../../../../services/types-service';
import { refreshSchema } from '../../../../services/context-service';
import { refreshIndex } from '../../../../services/search-service';

const isNode = new Function('try {return this===global;}catch(e){return false;}');

export default compose(
  connect(state => state, { ...actions }),
  withLoading(
    () => null,
    isNode() ? Promise.resolve() : Promise.all([refreshTypes(), refreshSchema(), refreshIndex()]),
  ),
)(
  class KeysPage extends Component {
    componentDidMount() {
      if (!this.props.keys || this.props.keys.length === 0) {
        this.props.getKeys();
      }
    }

    render() {
      const { keys, addKey, children } = this.props;
      return (
        <div className={style['keys-page-container']}>
          <div key="KeysList" className={style['keys-list']}>
            <div className={style['keys-list-wrapper']}>
              <KeysList keys={keys} />
            </div>
            <div className={style['add-button-wrapper']}>
              <button className={style['add-button']} onClick={() => addKey()}>Add key</button>
            </div>
          </div>
          <div key="Page" className={style['key-page']}>
            {children}
          </div>
        </div>
      );
    }
  },
);

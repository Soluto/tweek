import React from 'react';
import { Component } from 'react';
import * as actions from '../../ducks/keys';
import { connect } from 'react-redux';
import KeysList from '../KeysList/KeysList';
import style from './KeysPage.css';

export default connect(state => state, { ...actions })(
    class KeysPage extends Component {
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
              <div key="KeysList" className={style['keys-list']}>
                <KeysList className={style['keys-list-wrapper']} keys={keys} />
                <div className={style['add-button-wrapper']}>
                  <button className={style['add-button']} onClick={() => addKey() }>Add key</button>
                </div>
              </div>
              <div key="Page" className={style['key-page']}>
                {children}
              </div>
            </div>
        );
      }
    });

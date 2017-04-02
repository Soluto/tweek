import React from 'react';
import { Component } from 'react';
import * as actions from '../../../../store/ducks/keys';
import { connect } from 'react-redux';
import KeysList from '../KeysList/KeysList';
import Notifications from './Notifications';
import Alerts from './Alerts';
import style from './KeysPage.css';
import { compose } from 'recompose';
import withLoading from '../../../../hoc/with-loading';
import { refreshTypes } from '../../../../services/types-service';
import { refreshSchema } from "../../../../services/context-service";

export default compose(
  connect(state => state, { ...actions }),
  withLoading(() => null, refreshTypes()),
  withLoading(() => null, refreshSchema())
)
(class KeysPage extends Component {
    constructor(props) {
      super(props);
    }

    componentDidMount() {
      if (!this.props.keys) {
        this.props.getKeys([]);
      }
    }

    render() {
      const { keys, addKey, children, notifications, alerts } = this.props;
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
          <Notifications {...notifications} />
          <Alerts alerts={alerts} />
        </div>
      );
    }
  });
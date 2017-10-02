import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import * as keysActions from '../../../../store/ducks/keys';
import { addKey } from '../../../../store/ducks/selectedKey';
import KeysList from '../KeysList/KeysList';
import withLoading from '../../../../hoc/with-loading';
import { refreshTypes } from '../../../../services/types-service';
import { refreshSchema } from '../../../../services/context-service';
import hasUnsavedChanges from '../utils/hasUnsavedChanges';
import './KeysPage.css';

export default compose(
  connect(state => state, { ...keysActions, addKey }),
  withLoading(() => null, () => Promise.all([refreshTypes(), refreshSchema()])),
)(
  class KeysPage extends Component {
    displayName = 'KeysPage';

    componentDidMount() {
      if (!this.props.keys || this.props.keys.length === 0) {
        this.props.getKeys();
      }
    }

    render() {
      const { keys, addKey, children } = this.props;
      return (
        <div className="keys-page-container">
          <div key="KeysList" className="keys-list">
            <div className="keys-list-wrapper">
              <KeysList keys={keys} />
            </div>
            <div className="add-button-wrapper">
              <button className="add-key-button" data-comp="add-new-key" onClick={() => addKey(hasUnsavedChanges)}>Add key</button>
            </div>
          </div>
          <div key="Page" className="key-page" data-comp="key-page">
            {children}
          </div>
        </div>
      );
    }
  },
);

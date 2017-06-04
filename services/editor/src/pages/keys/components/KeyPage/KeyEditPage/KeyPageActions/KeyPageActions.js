import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import R from 'ramda';
import * as keysActions from '../../../../../../store/ducks/selectedKey';
import { deleteKey } from '../../../../../../store/ducks/keys';
import SaveButton from '../../../../../../components/common/SaveButton/SaveButton';
import './KeyPageActions.css';

const DeleteButton = ({ isSaving, selectedKey, deleteKey }) =>
  <button
    disabled={isSaving}
    className={'delete-key-button'}
    tabIndex="-1"
    onClick={() => deleteKey(selectedKey.key)}
  >
    Delete key
  </button>;

const SaveChangesButton = ({ selectedKey, saveKey, ...props }) =>
  <SaveButton
    {...props}
    tabIndex="-1"
    className={'save-changes-button'}
    onClick={() => saveKey(selectedKey.key)}
  />;

const comp = compose(
  connect(state => ({ selectedKey: state.selectedKey }), { ...keysActions, deleteKey }),
)(
  ({
    selectedKey,
    isInAddMode,
    saveKey,
    deleteKey,
    isReadonly,
    isHistoricRevision,
    isInStickyMode,
  }) => {
    const { local, remote, isSaving } = selectedKey;
    const hasChanges = !R.equals(local, remote);
    return (
      <div>
        {isReadonly
          ? <div className={'readonly-key-message'}>
              {' '}
              {isHistoricRevision ? 'This is an old revision of this key' : 'This key is readonly'}
              {' '}
            </div>
          : null}
        <div className={'key-action-buttons-wrapper'}>
          {!isInAddMode && !isInStickyMode
            ? <DeleteButton {...{ selectedKey, isSaving, deleteKey }} />
            : null}
          <SaveChangesButton {...{ selectedKey, isSaving, hasChanges, saveKey }} />
        </div>
      </div>
    );
  },
);

export default comp;

import React from 'react';
import { connect } from 'react-redux';
import { compose, mapProps } from 'recompose';
import R from 'ramda';
import * as keysActions from '../../../../../../store/ducks/selectedKey';
import { deleteKey } from '../../../../../../store/ducks/keys';
import SaveButton from '../../../../../../components/common/SaveButton/SaveButton';
import './KeyPageActions.css';

const DeleteButton = ({ isSaving, deleteKey }) =>
  <button disabled={isSaving} className={'delete-key-button'} tabIndex="-1" onClick={deleteKey}>
    Delete key
  </button>;

const KeyPageActions = compose(
  connect(state => ({ selectedKey: state.selectedKey }), { ...keysActions, deleteKey }),
  mapProps(({ saveKey, deleteKey, selectedKey: { key, local, remote, isSaving }, ...props }) => ({
    ...props,
    hasChanges: !R.equals(local, remote),
    deleteKey: () => deleteKey(key),
    saveKey: () => saveKey(key),
    isSaving,
  })),
)(
  ({
    isInAddMode,
    saveKey,
    deleteKey,
    isReadonly,
    isHistoricRevision,
    isInStickyMode,
    hasChanges,
    isSaving,
  }) =>
    <div>
      {isReadonly
        ? <div className={'readonly-key-message'}>
            {isHistoricRevision ? 'This is an old revision of this key' : 'This key is readonly'}
          </div>
        : null}
      <div className={'key-action-buttons-wrapper'}>
        {!isInAddMode && !isInStickyMode ? <DeleteButton {...{ isSaving, deleteKey }} /> : null}
        <SaveButton
          {...{ isSaving, hasChanges }}
          tabIndex="-1"
          id="save-changes-button"
          onClick={saveKey}
        />
      </div>
    </div>,
);

KeyPageActions.displayName = 'KeyPageActions';

export default KeyPageActions;

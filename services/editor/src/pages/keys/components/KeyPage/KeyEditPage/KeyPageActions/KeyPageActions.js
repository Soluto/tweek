import React from 'react';
import { connect } from 'react-redux';
import { compose, mapProps } from 'recompose';
import * as R from 'ramda';
import * as keysActions from '../../../../../../store/ducks/selectedKey';
import SaveButton from '../../../../../../components/common/SaveButton/SaveButton';
import './KeyPageActions.css';

const disableButton = ({ text, dataComp }) => props => (
  <button data-comp={dataComp} className="disable-button" tabIndex="-1" {...props}>
    {text}
  </button>
);

const DeleteButton = disableButton({ text: 'Delete key', dataComp: 'delete-key' });
const ArchiveButton = disableButton({ text: 'Archive key', dataComp: 'archive-key' });
const UnarchiveButton = disableButton({ text: 'Restore key', dataComp: 'unarchive-key' });

const validationPath = ['selectedKey', 'validation', 'isValid'];

const KeyPageActions = compose(
  connect(
    state => ({ selectedKey: state.selectedKey, isValid: R.path(validationPath, state) }),
    keysActions,
  ),
  mapProps(({ selectedKey: { key, local, remote, isSaving }, isInStickyMode, ...props }) => ({
    ...props,
    hasChanges: !R.equals(local, remote),
    isSaving,
    extraButtons: !isInStickyMode,
    archived: local && local.manifest.meta.archived,
  })),
)(
  ({
    saveKey,
    deleteKey,
    isReadonly,
    isHistoricRevision,
    hasChanges,
    isSaving,
    isValid,
    extraButtons,
    archived,
    archiveKey,
  }) => (
    <div>
      {isReadonly ? (
        <div className="readonly-key-message" data-comp="key-message">
          {isHistoricRevision ? 'This is an old revision of this key' : 'This key is readonly'}
        </div>
      ) : null}
      <div className="key-action-buttons-wrapper">
        {extraButtons && archived ? <DeleteButton disabled={isSaving} onClick={deleteKey} /> : null}
        {extraButtons ? (
          archived ? (
            <UnarchiveButton disabled={isSaving} onClick={() => archiveKey(false)} />
          ) : (
            <ArchiveButton disabled={isSaving} onClick={() => archiveKey(true)} />
          )
        ) : null}
        <SaveButton
          {...{ isValid, isSaving, hasChanges }}
          tabIndex="-1"
          data-comp="save-changes"
          onClick={saveKey}
        />
      </div>
    </div>
  ),
);

KeyPageActions.displayName = 'KeyPageActions';

export default KeyPageActions;

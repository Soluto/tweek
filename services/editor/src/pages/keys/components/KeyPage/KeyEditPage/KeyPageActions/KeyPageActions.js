import React from 'react';
import { connect } from 'react-redux';
import { compose, mapProps } from 'recompose';
import R from 'ramda';
import * as keysActions from '../../../../../../store/ducks/selectedKey';
import SaveButton from '../../../../../../components/common/SaveButton/SaveButton';
import './KeyPageActions.css';

const disableButton = ({ text, id }) => props =>
  <button id={id} className={'disable-button'} tabIndex="-1" {...props}>{text}</button>;

const DeleteButton = disableButton({ text: 'Delete key', id: 'delete-key-button' });
const ArchiveButton = disableButton({ text: 'Archive key', id: 'archive-key-button' });
const UnarchiveButton = disableButton({ text: 'Restore key', id: 'unarchive-key-button' });

const KeyPageActions = compose(
  connect(state => ({ selectedKey: state.selectedKey }), keysActions),
  mapProps(
    ({ selectedKey: { key, local, remote, isSaving }, isInAddMode, isInStickyMode, ...props }) => ({
      ...props,
      hasChanges: !R.equals(local, remote),
      isSaving,
      extraButtons: !isInAddMode && !isInStickyMode,
      archived: local && local.manifest.meta.archived,
    }),
  ),
)(
  ({
    saveKey,
    deleteKey,
    isReadonly,
    isHistoricRevision,
    hasChanges,
    isSaving,
    extraButtons,
    archived,
    archiveKey,
  }) =>
    <div>
      {isReadonly
        ? <div className={'readonly-key-message'}>
            {isHistoricRevision ? 'This is an old revision of this key' : 'This key is readonly'}
          </div>
        : null}
      <div className={'key-action-buttons-wrapper'}>
        {extraButtons && archived ? <DeleteButton disabled={isSaving} onClick={deleteKey} /> : null}
        {extraButtons
          ? archived
            ? <UnarchiveButton disabled={isSaving} onClick={() => archiveKey(false)} />
            : <ArchiveButton disabled={isSaving} onClick={() => archiveKey(true)} />
          : null}
        <SaveButton
          {...{ isSaving, hasChanges }}
          tabIndex="-1"
          data-comp="save-changes-button"
          onClick={saveKey}
        />
      </div>
    </div>,
);

KeyPageActions.displayName = 'KeyPageActions';

export default KeyPageActions;

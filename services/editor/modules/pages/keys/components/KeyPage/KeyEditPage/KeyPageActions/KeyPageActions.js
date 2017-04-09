import React from 'react';
import style from './KeyPageActions.css';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import * as keysActions from '../../../../../../store/ducks/selectedKey';
import { deleteKey } from '../../../../../../store/ducks/keys';
import { diff } from 'deep-diff';

const ArchiveButton = ({isSaving, selectedKey, hasChanges, archiveKey}) => (
  <button
    disabled={hasChanges || isSaving}
    className={style['delete-key-button']}
    tabIndex="-1"
    onClick={() => archiveKey(selectedKey.key)}>Archive key</button>
);

const UnarchiveButton = ({isSaving, selectedKey, unarchiveKey}) => (
  <button
    disabled={isSaving}
    className={style['delete-key-button']}
    tabIndex="-1"
    onClick={() => unarchiveKey(selectedKey.key)}>Unarchive key</button>
);

const DeleteButton = ({isSaving, selectedKey, deleteKey}) => (
  <button
    disabled={isSaving}
    className={style['delete-key-button']}
    tabIndex="-1"
    onClick={() => deleteKey(selectedKey.key)}>Delete key</button>
);

const SaveButton = ({selectedKey, isSaving, hasChanges, saveKey}) => (
  <button
    disabled={!hasChanges || isSaving}
    data-state-has-changes={hasChanges}
    data-state-is-saving={isSaving}
    tabIndex="-1"
    className={style['save-changes-button']}
    onClick={() => saveKey(selectedKey.key)}>
    {isSaving ? 'Saving...' : 'Save changes'}
  </button>
);

const ActionButtons = ({isInAddMode, isInStickyMode, saveKey, selectedKey, isSaving, deleteKey, archiveKey, unarchiveKey, hasChanges}) => {
  var shouldDiplayDeleteButtons = !isInAddMode && !isInStickyMode;
  const isArchived = selectedKey.local && selectedKey.local.meta.archived;

  return <div className={style['key-action-buttons-wrapper']}>
    {isArchived && shouldDiplayDeleteButtons ? <DeleteButton {...{selectedKey, isSaving, deleteKey}} /> : null}
    {isArchived ?
      shouldDiplayDeleteButtons ? <UnarchiveButton {...{selectedKey, isSaving, unarchiveKey}} /> : null
      :  shouldDiplayDeleteButtons ? <ArchiveButton {...{selectedKey, isSaving, hasChanges, archiveKey}} /> : null}
    <SaveButton {...{selectedKey, isSaving, hasChanges, saveKey}} />
  </div>;
};


const comp = compose(
  connect(
    state => ({ selectedKey: state.selectedKey }),
    { ...keysActions, deleteKey })
)(
  ({ selectedKey, isInAddMode, saveKey, deleteKey, isReadonly, isInStickyMode, updateKeyMetaDef }) => {
    const { local, remote, isSaving } = selectedKey;
    const changes = diff(local, remote);
    const hasChanges = (changes || []).length > 0;
    const archiveKey = () => {
      updateKeyMetaDef({...local.meta, archived: true});
      saveKey(selectedKey.key);
    };
    const unarchiveKey = () => {
      updateKeyMetaDef({...local.meta, archived: false});
      saveKey(selectedKey.key);
    };

    return <div>
      {isReadonly ?
        <div className={style['readonly-key-message']}>This key is readonly</div>
        : null}
        <ActionButtons {...{isInAddMode, isInStickyMode, saveKey, selectedKey, isSaving, deleteKey, archiveKey, unarchiveKey, hasChanges}} />
      </div>
  });

export default comp;

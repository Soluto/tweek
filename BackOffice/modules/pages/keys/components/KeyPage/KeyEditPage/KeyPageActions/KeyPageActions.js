import React from 'react';
import style from './KeyPageActions.css';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import * as keysActions from '../../../../../../store/ducks/selectedKey';
import { deleteKey } from '../../../../../../store/ducks/keys';
import { diff } from 'deep-diff';

const DeleteButton = ({isSaving, selectedKey, deleteKey}) => (
  <button
    disabled={isSaving}
    className={style['delete-key-button']}
    tabIndex="-1"
    onClick={() => {
      if (confirm('Are you sure?')) {
        deleteKey(selectedKey.key);
      }
    } }>Delete key</button>
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

const comp = compose(
  connect(
    state => ({ selectedKey: state.selectedKey }),
    { ...keysActions, deleteKey })
)(
  ({ selectedKey, isInAddMode, saveKey, deleteKey, isReadonly, isInStickyMode }) => {
    const { local, remote, isSaving } = selectedKey;
    const changes = diff(local, remote);
    const hasChanges = (changes || []).length > 0;

    return (
      <div>
        {isReadonly ?
          <div className={style['readonly-key-message']}>This key is readonly</div>
          : null}
        <div className={style['key-action-buttons-wrapper']}>
          {!isInAddMode && !isInStickyMode ?
            <DeleteButton isSaving={isSaving}
              selectedKey={selectedKey}
              deleteKey={deleteKey} />
            : null}
          <SaveButton selectedKey={selectedKey}
            isSaving={isSaving}
            hasChanges={hasChanges}
            saveKey={saveKey}
            />
        </div>
      </div>
    );
  });

export default comp;

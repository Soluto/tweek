import React from 'react';
import style from './KeyPageActions.css';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import * as keysActions from '../../../../ducks/selectedKey';
import { deleteKey } from '../../../../ducks/keys';
import { diff } from 'deep-diff';

const comp = compose(
  connect(
    state => ({ selectedKey: state.selectedKey }),
    { ...keysActions, deleteKey })
)(
  ({ selectedKey, isInAddMode, saveKey, deleteKey }) => {
    const { local, remote, isSaving, isDeleting } = selectedKey;
    const changes = diff(local, remote);
    const hasChanges = (changes || []).length > 0;
    return (
      <div className={style['key-action-buttons-wrapper']}>
        {!isInAddMode ?
          <button disabled={isSaving}
            className={style['delete-key-button']}
            onClick={() => {
              if (confirm('Are you sure?')) {
                deleteKey(selectedKey.key);
              }
            } }>
            Delete key
            </button>
          : null}
        <button disabled={!hasChanges || isSaving}
          data-state-has-changes={hasChanges}
          data-state-is-saving={isSaving}
          className={style['save-changes-button']}
          onClick={() => saveKey(selectedKey.key)}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    );
  });

export default comp;

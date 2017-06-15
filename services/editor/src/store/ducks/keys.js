import { handleActions } from 'redux-actions';
import R from 'ramda';
import Promise from 'bluebird';
import { push } from 'react-router-redux';
import fetch from '../../utils/fetch';
import { showError } from './notifications';
import { showConfirm } from './alerts';

const KEYS_UPDATED = 'KEYS_UPDATED';
const KEY_ADDING = 'KEY_ADDING';
const KEY_ADDED = 'KEY_ADDED';
const KEY_DELETED = 'KEY_DELETED';
const KEY_DELETING = 'KEY_DELETING';

export const addKey = key =>
  async function (dispatch) {
    dispatch(push('/keys/_blank'));
    dispatch({ type: KEY_ADDING, payload: key });
  };

const performDeleteKey = key =>
  async function (dispatch) {
    dispatch({ type: KEY_DELETING, payload: key });

    await Promise.delay(1);
    dispatch(push('/keys'));
    try {
      await fetch(`/api/keys/${key}`, {
        method: 'delete',
      });

      dispatch({ type: KEY_DELETED, payload: key });
    } catch (error) {
      dispatch(showError({ title: 'Failed to delete key!', error }));
    }
  };

const deleteKeyAlert = key => ({
  title: 'Warning',
  message: `Are you sure you want to delete '${key}' key?`,
});

export function deleteKey(key) {
  return async function (dispatch) {
    if ((await dispatch(showConfirm(deleteKeyAlert(key)))).result) {
      dispatch(performDeleteKey(key));
    }
  };
}

export function getKeys() {
  return async function (dispatch) {
    try {
      const result = await await fetch('/api/keys');

      const payload = await result.json();

      dispatch({ type: KEYS_UPDATED, payload });
    } catch (error) {
      dispatch(showError({ title: 'Failed to retrieve keys!', error }));
    }
  };
}

export default handleActions(
  {
    [KEYS_UPDATED]: (state, action) => action.payload,
    [KEY_ADDED]: (state, action) => [...state, action.payload],
    [KEY_DELETING]: (state, action) => {
      const deletedKeyIndex = state.indexOf(action.payload);
      return deletedKeyIndex < 0 ? state : R.remove(deletedKeyIndex, 1, state);
    },
  },
  [],
);

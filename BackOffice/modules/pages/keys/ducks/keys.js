import { handleActions } from 'redux-actions';
import R from 'ramda';

const KEYS_UPDATED = 'KEYS_UPDATED';
const KEY_ADDING = 'KEY_ADDING';
const KEY_ADDED = 'KEY_ADDED';
const KEY_DELETED = 'KEY_DELETED';
const KEY_DELETING = 'KEY_DELETING';

import { withJSONdata } from '../../../utils/http';
import { push } from 'react-router-redux';

export const addKey = (key) => async function (dispatch) {
  dispatch(push(`/keys/_blank`));
  dispatch({ type: KEY_ADDING, payload: key });
};

export const deleteKey = (key) => async function (dispatch) {
  dispatch({ type: KEY_DELETING, payload: key });

  dispatch(push('/keys'));

  await fetch(`/api/keys/${key}`, {
    credentials: 'same-origin',
    method: 'delete',
  });

  dispatch({ type: KEY_DELETED, payload: key });
};

export async function getKeys(payload) {
  return { type: KEYS_UPDATED, payload };
}

export default handleActions({
  [KEYS_UPDATED]: (state, action) => action.payload,
  [KEY_ADDED]: (state, action) => [...state, action.payload],
  [KEY_DELETING]: (state, action) => {
    const deletedKeyIndex = state.indexOf(action.payload);
    return deletedKeyIndex < 0 ? state : R.remove(deletedKeyIndex, 1, state);
  },
}, []);

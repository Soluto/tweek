import { handleActions } from 'redux-actions';
const KEYS_UPDATED = 'KEYS_UPDATED';
const KEY_ADDED = 'KEY_ADDED';
import { withJSONdata } from '../../../utils/http';
import { push } from 'react-router-redux';

export const addKey = (key) => async function (dispatch) {
  dispatch({ type: 'ADDING_KEY', payload: key });
  const meta = {
    displayName: `${key}`,
    description: '',
    tags: [],
  };

  const ruleDef = {
    source: '[]',
    type: 'jpad',
  };
  dispatch({ type: KEY_ADDED, payload: key });
  dispatch({ type: 'KEY_DOWNLOADED', payload: { key, meta, ruleDef } });
  dispatch(push(`/keys/${key}`));

  await fetch(`/api/keys/${key}`, {
    credentials: 'same-origin',
    method: 'put',
    ...withJSONdata({ meta, ruleDef }),
  });
};

export async function getKeys(payload) {
  return { type: KEYS_UPDATED, payload };
}

export default handleActions({
  [KEYS_UPDATED]: (state, action) => action.payload,
  [KEY_ADDED]: (state, action) => [...state, action.payload],
}, []);

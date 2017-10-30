import { handleActions } from 'redux-actions';
import * as R from 'ramda';
import fetch from '../../utils/fetch';
import { showError } from './notifications';

const KEYS_UPDATED = 'KEYS_UPDATED';
const KEY_ADDED = 'KEY_ADDED';
const KEY_REMOVED = 'KEY_REMOVED';

export function addKeyToList(key) {
  return { type: KEY_ADDED, payload: key };
}

export function removeKeyFromList(key) {
  return { type: KEY_REMOVED, payload: key };
}

export function getKeys() {
  return async function (dispatch) {
    try {
      const result = await await fetch('/api/manifests');
      const manifests = await result.json();
      const payload = manifests.filter(m => !m.meta.archived).map(x => x.key_path);
      dispatch({ type: KEYS_UPDATED, payload });
    } catch (error) {
      dispatch(showError({ title: 'Failed to retrieve keys!', error }));
    }
  };
}

export default handleActions(
  {
    [KEYS_UPDATED]: (state, action) => R.uniq(action.payload),
    [KEY_ADDED]: (state, action) => R.uniq([...state, action.payload]),
    [KEY_REMOVED]: (state, action) => {
      const deletedKeyIndex = state.indexOf(action.payload);
      return deletedKeyIndex < 0 ? state : R.remove(deletedKeyIndex, 1, state);
    },
  },
  [],
);

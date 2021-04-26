import * as R from 'ramda';
import { handleActions } from 'redux-actions';
import { showError, tweekManagementClient } from '../../utils';

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
      const manifests = await tweekManagementClient.getAllKeyManifests();
      const payload = R.indexBy(R.prop('key_path'), manifests);
      dispatch({ type: KEYS_UPDATED, payload });
    } catch (error) {
      showError(error, 'Failed to retrieve keys!');
    }
  };
}

export default handleActions(
  {
    [KEYS_UPDATED]: (state, { payload }) => payload,
    [KEY_ADDED]: (state, { payload }) => R.assoc(payload['key_path'], payload, state),
    [KEY_REMOVED]: (state, { payload }) => R.dissoc(payload, state),
  },
  [],
);

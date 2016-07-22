import { handleActions } from 'redux-actions';
const KEYS_UPDATED = 'KEYS_UPDATED';

export async function getKeys(payload) {
  return { type: 'KEYS_UPDATED', payload: payload };
}

export default handleActions({
  KEYS_UPDATED: (state, action) => action.payload
}, [])

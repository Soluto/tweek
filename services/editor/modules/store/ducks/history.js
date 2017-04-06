import { handleActions } from 'redux-actions';

const HISTORY_UPDATED = 'HISTORY_UPDATED';

export function getHistory(payload) {
  return { type: HISTORY_UPDATED, payload };
}

export default handleActions({
  [HISTORY_UPDATED]: (state, action) => action.payload,
}, []);

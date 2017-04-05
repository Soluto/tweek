import { handleActions } from 'redux-actions';

const IDENTITIES_UPDATED = 'IDENTITIES_UPDATED';

export function loadIdentities(payload) {
  return { type: IDENTITIES_UPDATED, payload };
}

export default handleActions({
  [IDENTITIES_UPDATED]: (state, action) => action.payload
}, []);

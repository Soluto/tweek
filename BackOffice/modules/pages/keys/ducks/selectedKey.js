import { handleActions } from 'redux-actions';
const KEY_DOWNLOADED = 'KEY_DOWNLOADED';
const KEY_RULEDEF_UPDATED = 'KEY_RULEDEF_UPDATED';
const KEY_RULE_META_UPDATED = 'KEY_RULE_META_UPDATED';

export async function downloadKey(key) {
  const { ruleDef, meta } = await (await fetch(`/api/keys/${key}`, { credentials: 'same-origin' })).json();
  return { type: KEY_DOWNLOADED, payload:
  {
    key,
    meta,
    ruleDef,
  } };
}

export function updateKeyRuleDef(ruleDef) {
  return { type: KEY_RULEDEF_UPDATED, payload: ruleDef };
}

export function updateKeyMetaDef(meta) {
  return { type: KEY_RULE_META_UPDATED, payload: meta };
}

function withJSONdata(data) {
  return {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
}
export function saveKey(key) {
  return async function (dispatch, getState) {
    const { selectedKey: keyData } = getState();
    await fetch(`/api/keys/${key}`, {
      credentials: 'same-origin',
      method: 'put',
      ...withJSONdata(keyData),
    });
  };
}


export default handleActions({
  [KEY_DOWNLOADED]: (state, action) => action.payload,
  [KEY_RULEDEF_UPDATED]: (state, { payload }) => ({
    ...state,
    ruleDef: payload,
  }),
  [KEY_RULE_META_UPDATED]: (state, { payload }) => ({
    ...state,
    meta: payload,
  }),
}, null);

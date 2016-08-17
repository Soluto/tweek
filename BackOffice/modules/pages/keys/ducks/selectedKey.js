import { handleActions } from 'redux-actions';
import R from 'ramda';
const KEY_DOWNLOADED = 'KEY_DOWNLOADED';
const KEY_RULEDEF_UPDATED = 'KEY_RULEDEF_UPDATED';
const KEY_RULE_META_UPDATED = 'KEY_RULE_META_UPDATED';
const KEY_SAVED = 'KEY_SAVED';
const KEY_SAVING = 'KEY_SAVING';
const KEY_DELETED = 'KEY_DELETED';
const KEY_DELETING = 'KEY_DELETING';

export async function downloadKey(key) {
  const { ruleDef, meta } = await (await fetch(`/api/keys/${key}`, { credentials: 'same-origin' })).json();
  return {
    type: KEY_DOWNLOADED, payload:
    {
      key,
      meta,
      ruleDef,
    }
  };
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
    const { selectedKey: { local: keyData } } = getState();
    dispatch({ type: KEY_SAVING });
    await fetch(`/api/keys/${key}`, {
      credentials: 'same-origin',
      method: 'put',
      ...withJSONdata(keyData),
    });
  dispatch({ type: KEY_SAVED });
};
}

export function deleteKey(key) {
  return async function (dispatch, getState) {
    const { selectedKey: { local: keyData } } = getState();
    dispatch({ type: KEY_DELETING });
    await fetch(`/api/keys/${key}`, {
      credentials: 'same-origin',
      method: 'delete',
      ...withJSONdata(keyData),
    });
  dispatch({ type: KEY_DELETED });
};
}

export default handleActions({
  [KEY_DOWNLOADED]: (state, { payload: { key, ...props } }) => ({
    key,
    local: R.clone(props),
    remote: R.clone(props),
  }),
    [KEY_RULEDEF_UPDATED]: (state, { payload }) => ({
    ...state,
      local: {
      ...state.local,
        ruleDef: { ...state.local.ruleDef, ...payload },
      },
    }),
      [KEY_RULE_META_UPDATED]: (state, { payload }) => ({
    ...state,
        local: {
      ...state.local,
          meta: payload,
        },
      }),
        [KEY_SAVED]: (state) => ({
    ...state,
          remote: R.clone(state.local),
          isSaving: false,
        }),
          [KEY_SAVING]: (state) => ({
    ...state,
            isSaving: true,
          }),
}, null);

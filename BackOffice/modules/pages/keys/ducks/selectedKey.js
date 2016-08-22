import { handleActions } from 'redux-actions';
import R from 'ramda';
import { push } from 'react-router-redux';
import { BLANK_KEY } from './blankKeyDefinition';

const KEY_OPENED = 'KEY_OPENED';
const KEY_RULEDEF_UPDATED = 'KEY_RULEDEF_UPDATED';
const KEY_RULE_META_UPDATED = 'KEY_RULE_META_UPDATED';
const KEY_SAVED = 'KEY_SAVED';
const KEY_SAVING = 'KEY_SAVING';
const KEY_NAME_CHANGE = 'KEY_NAME_CHANGE';

export async function openKey(key) {
  if (key === BLANK_KEY.key) {
    return {
      type: KEY_OPENED, payload: BLANK_KEY,
    };
  }

  const { ruleDef, meta } = await (await fetch(`/api/keys/${key}`, { credentials: 'same-origin' })).json();
  return {
    type: KEY_OPENED, payload:
    {
      key,
      meta,
      ruleDef,
    },
  };
}

export function updateKeyRuleDef(ruleDef) {
  return { type: KEY_RULEDEF_UPDATED, payload: ruleDef };
}

export function updateKeyMetaDef(meta) {
  return { type: KEY_RULE_META_UPDATED, payload: meta };
}

export function updateKeyName(name) {
  return { type: KEY_NAME_CHANGE, payload: name };
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

export function saveKey() {
  return async function (dispatch, getState) {
    const { selectedKey: { local: keyData, key } } = getState();

    const savedKey = keyData.key || key;
    if (!saveKey) {
      alert('Key name cannot be empty');
      return;
    }

    if (saveKey === BLANK_KEY.key) {
      alert('Invalid key name');
      return;
    }

    dispatch({ type: KEY_SAVING });
    await fetch(`/api/keys/${savedKey}`, {
      credentials: 'same-origin',
      method: 'put',
      ...withJSONdata(keyData),
    });

  dispatch({ type: KEY_SAVED });
  dispatch({ type: 'KEY_ADDED', payload: keyData.key });
  dispatch(push(`/keys/${keyData.key}`));
};
}

export default handleActions({
  [KEY_OPENED]: (state, { payload: { key, ...props } }) => {
  return {
    key,
    local: R.clone(props),
    remote: R.clone(props),
  };
},
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
    [KEY_SAVED]: ({ local: { key, ...localData }, ...otherState }) => ({
      key,
      ...otherState,
      local: localData,
      remote: R.clone(localData),
      isSaving: false,
    }),
      [KEY_SAVING]: (state) => ({
        ...state,
        isSaving: true,
      }),
        [KEY_NAME_CHANGE]: ({ local: { key, ...localData }, ...otherState }, { payload }) => ({
          ...otherState,
          local: {
            ...localData,
            meta: { ...localData.meta, displayName: payload },
            ...(payload === '' ? {} : { key: payload }), // get displayName from payload
        },
        }),
}, null);

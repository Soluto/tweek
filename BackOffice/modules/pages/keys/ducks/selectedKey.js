import { handleActions } from 'redux-actions';
import R from 'ramda';
import { push } from 'react-router-redux';
import { createBlankKey, BLANK_KEY_NAME } from './blankKeyDefinition';
import { withJsonData } from '../../../utils/http';

const KEY_OPENED = 'KEY_OPENED';
const KEY_RULEDEF_UPDATED = 'KEY_RULEDEF_UPDATED';
const KEY_RULE_META_UPDATED = 'KEY_RULE_META_UPDATED';
const KEY_SAVED = 'KEY_SAVED';
const KEY_SAVING = 'KEY_SAVING';
const KEY_NAME_CHANGE = 'KEY_NAME_CHANGE';

export async function openKey(key) {
  if (key === BLANK_KEY_NAME) {
    return {
      type: KEY_OPENED, payload: createBlankKey(),
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

export function saveKey() {
  return async function (dispatch, getState) {
    const { selectedKey: { local: keyData, key } } = getState();
    const isNewKey = !!(keyData.key);
    const savedKey = keyData.key || key;
    if (!savedKey) {
      alert('Key name cannot be empty');
      return;
    }

    if (savedKey === BLANK_KEY_NAME) {
      alert('Invalid key name');
      return;
    }

    dispatch({ type: KEY_SAVING });

    await fetch(`/api/keys/${savedKey}`, {
      credentials: 'same-origin',
      method: 'put',
      ...withJsonData(keyData),
    });
    
    if (isNewKey) {
      dispatch({ type: 'KEY_ADDED', payload: savedKey });
      dispatch(push(`/keys/${savedKey}`));
    }
    await dispatch(openKey(savedKey));
    dispatch({ type: KEY_SAVED });
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

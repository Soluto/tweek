import { handleActions } from 'redux-actions';
import R from 'ramda';
import { push } from 'react-router-redux';
import { createBlankKey, createBlankKeyMeta, BLANK_KEY_NAME } from './ducks-utils/blankKeyDefinition';
import { withJsonData } from '../../utils/http';
import keyNameValidations from './ducks-utils/validations/key-name-validations';
import keyValueTypeValidations from './ducks-utils/validations/key-value-type-validations';
import { downloadTags } from './tags.js';
import * as ContextService from "../../services/context-service";
import fetch from '../../utils/fetch';
import { showError } from './notifications';

const KEY_OPENED = 'KEY_OPENED';
const KEY_OPENING = 'KEY_OPENING';
const KEY_RULEDEF_UPDATED = 'KEY_RULEDEF_UPDATED';
const KEY_RULE_META_UPDATED = 'KEY_RULE_META_UPDATED';
const KEY_SAVED = 'KEY_SAVED';
const KEY_SAVING = 'KEY_SAVING';
const KEY_NAME_CHANGE = 'KEY_NAME_CHANGE';
const KEY_VALIDATION_CHANGE = 'KEY_VALIDATION_CHANGE';
const KEY_VALUE_TYPE_CHANGE = 'KEY_VALUE_TYPE_CHANGE';
const SHOW_KEY_VALIDATIONS = 'SHOW_KEY_VALIDATIONS';

export function openKey(key) {
  return async function (dispatch) {
    dispatch(downloadTags());

    try {
      ContextService.refreshSchema();
    } catch (error) {
      dispatch(showError({title: "Failed to refresh schema", error}));
    }

    if (key === BLANK_KEY_NAME) {
      dispatch({ type: KEY_OPENED, payload: createBlankKey() });
      return;
    }

    dispatch({ type: KEY_OPENING, payload: key });

    let keyData;

    try {
      keyData = await (await fetch(`/api/keys/${key}`, { credentials: 'same-origin' })).json();
    } catch (exp) {
      dispatch({ type: KEY_OPENED, payload: { key } });
      return;
    }

    const meta = keyData.meta || createBlankKeyMeta(key);
    const keyOpenedPayload = {
      key,
      keyDef: {
        ...keyData.keyDef,
        valueType: meta.valueType || "string",
      },
      meta
    };

    dispatch({ type: KEY_OPENED, payload: keyOpenedPayload });
  };
}

export function updateKeyDef(keyDef) {
  return { type: KEY_RULEDEF_UPDATED, payload: keyDef };
}

export function updateKeyMetaDef(meta) {
  return { type: KEY_RULE_META_UPDATED, payload: meta };
}

export function updateKeyValueType(keyValueType) {
  return async function (dispatch, getState) {
    const rules = JSON.parse(getState().selectedKey.local.keyDef.source).rules;
    const shouldShowAlert =
      rules.some(x => x.Type !== 'SingleVariant' || (x.Value !== null && x.Value !== undefined && x.Value !== ''));

    if (shouldShowAlert && !confirm(`Rules values will try be converted to new type. Proceed?`)) {
      return;
    }

    const keyValueTypeValidation = keyValueTypeValidations(keyValueType);
    keyValueTypeValidation.isShowingHint = !keyValueTypeValidation.isValid;

    dispatch({ type: KEY_VALUE_TYPE_CHANGE, payload: keyValueType });

    const currentValidationState = getState().selectedKey.validation;
    const newValidation = {
      ...currentValidationState,
      meta: {
        ...currentValidationState.meta,
        valueType: keyValueTypeValidation,
      },
    };

    dispatch({ type: KEY_VALIDATION_CHANGE, payload: newValidation });
  };
}

export function updateKeyName(newKeyName) {
  return async function (dispatch, getState) {
    const keyNameValidation = keyNameValidations(newKeyName, getState().keys);
    keyNameValidation.isShowingHint = !keyNameValidation.isValid;

    dispatch({ type: KEY_NAME_CHANGE, payload: newKeyName });

    const currentValidationState = getState().selectedKey.validation;
    const newValidation = {
      ...currentValidationState,
      key: keyNameValidation,
    };

    dispatch({ type: KEY_VALIDATION_CHANGE, payload: newValidation });
  };
}

export function saveKey() {
  return async function (dispatch, getState) {
    const currentState = getState();
    const {selectedKey: {local, key}} = currentState;
    const isNewKey = !!(local.key);
    const savedKey = local.key || key;

    if (!currentState.selectedKey.validation.isValid) {
      dispatch({ type: SHOW_KEY_VALIDATIONS });
      return;
    }

    dispatch({type: KEY_SAVING});
    let isSaveSucceeded;
    try {
      await fetch(`/api/keys/${savedKey}`, {
        credentials: 'same-origin',
        method: 'put',
        ...withJsonData(local),
      });
      isSaveSucceeded = true;
    } catch (error) {
      isSaveSucceeded = false;
      dispatch(showError({title: "Failed to save key", error}));
      return;
    } finally {
      dispatch({type: KEY_SAVED, payload: {keyName: savedKey, isSaveSucceeded}});
    }

    if (isNewKey) dispatch({ type: 'KEY_ADDED', payload: savedKey });
    const shouldOpenNewKey = isNewKey && getState().selectedKey.key === BLANK_KEY_NAME;

    if (shouldOpenNewKey) {
      dispatch(push(`/keys/${savedKey}`));
    }
  };
}

const handleKeyOpened = (state, {payload: {key, ...keyData}}) => {
  const validation = key !== BLANK_KEY_NAME ?
    {
      isValid: true,
    } :
    {
      key: keyNameValidations(key, []),
      meta: {
        valueType: keyValueTypeValidations(keyData.meta.valueType),
      },
      isValid: false,
    };

  setValidationHintsVisability(validation, false);

  return {
    local: R.clone(keyData),
    remote: R.clone(keyData),
    key,
    isLoaded: true,
    validation,
  };
};

const handleKeyOpening = (state, {payload: {key}}) => {
  return {
    key,
    isLoaded: false,
  };
};

const handleKeyRuleDefUpdated = (state, {payload}) => ({
  ...state,
  local: {
    ...state.local,
    keyDef: { ...state.local.keyDef, ...payload },
  },
});

const handleKeyMetaUpdated = (state, {payload}) => ({
  ...state,
  local: {
    ...state.local,
    meta: payload,
  },
});

const handleKeySaved = ({local, remote, ...state}, {payload: {keyName, isSaveSucceeded}}) => {
  return state.key === BLANK_KEY_NAME || state.key === keyName ?
    {
      ...state,
      isSaving: false,
      local,
      remote: isSaveSucceeded ? R.clone(local) : remote,
    } :
    ({ ...state });
};

const handleKeySaving = ({...state}) => ({
  ...state,
  isSaving: true,
});

const handleKeyNameChange = ({local: {key, ...localData}, ...otherState}, {payload}) => ({
  ...otherState,
  local: {
    ...localData,
    meta: { ...localData.meta, displayName: payload },
    ...(payload === '' ? {} : { key: payload }),
  },
});

const handleKeyValidationChange = ({...state}, {payload}) => {
  const isKeyInvalid = isStateInvalid(payload);
  return {
    ...state,
    validation: {
      ...payload,
      isValid: !isKeyInvalid
    }
  };
};

const handleKeyDeleting = ({remote, ...otherState}) => {
  return ({
    ...otherState,
    local: { ...remote },
    remote: { ...remote },
  });
};

const handleKeyValueTypeChange = ({local: {keyDef, meta, ...restOfLocal}, ...state}, {payload}) => ({
  ...state,
  local: {
    ...restOfLocal,
    keyDef: {
      ...keyDef,
      valueType: payload,
    },
    meta: {
      ...meta,
      valueType: payload,
    },
  },
});

const handleShowKeyValidations = ({validation, ...state}) => {
  setValidationHintsVisability(validation, true);
  return {
    ...state,
    validation,
  };
}

const isStateInvalid = (validationState) => {
  let isOneValidationTypeInvalid = Object.keys(validationState)
    .map(x => validationState[x])
    .filter(x => typeof (x) === 'object')
    .some(x => {
      return x.isValid === false || isStateInvalid(x)
    });

  return isOneValidationTypeInvalid;
}

const setValidationHintsVisability = (validationState, isShown) => {
  Object.keys(validationState)
    .map(x => validationState[x])
    .filter(x => typeof (x) === 'object')
    .map(x => {
      setValidationHintsVisability(x, isShown);
      return x;
    })
    .filter(x => x.isValid === false)
    .forEach(x => {
      x.isShowingHint = isShown;
      setValidationHintsVisability(x, isShown);
    });
}

export default handleActions({
  [KEY_OPENED]: handleKeyOpened,
  [KEY_OPENING]: handleKeyOpening,
  [KEY_RULEDEF_UPDATED]: handleKeyRuleDefUpdated,
  [KEY_RULE_META_UPDATED]: handleKeyMetaUpdated,
  [KEY_SAVED]: handleKeySaved,
  [KEY_SAVING]: handleKeySaving,
  [KEY_NAME_CHANGE]: handleKeyNameChange,
  [KEY_VALIDATION_CHANGE]: handleKeyValidationChange,
  ['KEY_DELETING']: handleKeyDeleting,
  [KEY_VALUE_TYPE_CHANGE]: handleKeyValueTypeChange,
  [SHOW_KEY_VALIDATIONS]: handleShowKeyValidations,
}, null);
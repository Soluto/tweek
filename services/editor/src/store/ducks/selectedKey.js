import { handleActions } from 'redux-actions';
import R from 'ramda';
import { push } from 'react-router-redux';
import * as ContextService from '../../services/context-service';
import fetch from '../../utils/fetch';
import { withJsonData } from '../../utils/http';
import {
  createBlankJPadKey,
  createBlankKeyManifest,
  BLANK_KEY_NAME,
} from './ducks-utils/blankKeyDefinition';
import keyNameValidations from './ducks-utils/validations/key-name-validations';
import keyValueTypeValidations from './ducks-utils/validations/key-value-type-validations';
import { downloadTags } from './tags';
import { showError } from './notifications';
import { showConfirm } from './alerts';

const KEY_OPENED = 'KEY_OPENED';
const KEY_OPENING = 'KEY_OPENING';
const KEY_RULEDEF_UPDATED = 'KEY_RULEDEF_UPDATED';
const KEY_MANIFEST_UPDATED = 'KEY_MANIFEST_UPDATED';
const KEY_SAVED = 'KEY_SAVED';
const KEY_SAVING = 'KEY_SAVING';
const KEY_NAME_CHANGE = 'KEY_NAME_CHANGE';
const KEY_VALIDATION_CHANGE = 'KEY_VALIDATION_CHANGE';
const KEY_VALUE_TYPE_CHANGE = 'KEY_VALUE_TYPE_CHANGE';
const SHOW_KEY_VALIDATIONS = 'SHOW_KEY_VALIDATIONS';

export function openKey(key, { revision } = {}) {
  return async function (dispatch) {
    dispatch(downloadTags());
    try {
      ContextService.refreshSchema();
    } catch (error) {
      dispatch(showError({ title: 'Failed to refresh schema', error }));
    }

    if (key === BLANK_KEY_NAME) {
      dispatch({ type: KEY_OPENED, payload: createBlankJPadKey() });
      return;
    }

    dispatch({ type: KEY_OPENING, payload: key });

    let keyData;
    const search = revision ? `?revision=${revision}` : '';
    try {
      keyData = await (await fetch(`/api/keys/${key}${search}`, {
        credentials: 'same-origin',
      })).json();
    } catch (exp) {
      dispatch({ type: KEY_OPENED, payload: { key } });
      return;
    }

    const manifest = keyData.manifest || createBlankKeyManifest(key);
    const keyOpenedPayload = {
      key,
      keyDef: keyData.keyDef,
      manifest,
      revisionHistory: keyData.revisionHistory,
    };

    dispatch({ type: KEY_OPENED, payload: keyOpenedPayload });
  };
}

export function updateKeyDef(keyDef) {
  return { type: KEY_RULEDEF_UPDATED, payload: keyDef };
}

export function updateKeyMetaDef(manifest) {
  return { type: KEY_MANIFEST_UPDATED, payload: manifest };
}

function getAllRules({ jpad, rules = [jpad.rules], depth = jpad.partitions.length }) {
  return depth === 0
    ? R.flatten(rules)
    : getAllRules({ rules: R.flatten(rules.map(x => Object.values(x))), depth: depth - 1 });
}

const convertRuleValuesAlert = {
  title: 'Attention',
  message: 'Rule values will try to be converted to new type.\nDo you want to continue?',
};

export function updateKeyValueType(keyValueType) {
  return async function (dispatch, getState) {
    const jpad = JSON.parse(getState().selectedKey.local.keyDef.source);
    const allRules = getAllRules({ jpad });
    const shouldShowAlert = allRules.some(
      x =>
        x.Type !== 'SingleVariant' || (x.Value !== null && x.Value !== undefined && x.Value !== ''),
    );

    if (shouldShowAlert && !(await dispatch(showConfirm(convertRuleValuesAlert))).result) return;

    const keyValueTypeValidation = keyValueTypeValidations(keyValueType);
    keyValueTypeValidation.isShowingHint = !keyValueTypeValidation.isValid;

    dispatch({ type: KEY_VALUE_TYPE_CHANGE, payload: keyValueType });

    const currentValidationState = getState().selectedKey.validation;
    const newValidation = {
      ...currentValidationState,
      manifest: {
        ...currentValidationState.manifest,
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
    const { selectedKey: { local, key } } = currentState;
    const isNewKey = !!local.key;
    const savedKey = local.key || key;

    if (!currentState.selectedKey.validation.isValid) {
      dispatch({ type: SHOW_KEY_VALIDATIONS });
      return;
    }

    dispatch({ type: KEY_SAVING });
    let isSaveSucceeded = false,
      revisionHistory = undefined;
    try {
      await fetch(`/api/keys/${savedKey}`, {
        credentials: 'same-origin',
        method: 'put',
        ...withJsonData(local),
      });
      isSaveSucceeded = true;
      try {
        revisionHistory = await (await fetch(`/api/revision-history/${savedKey}`)).json();
      } catch (error) {
        dispatch(showError({ title: 'Failed to refresh revisionHistory', error }));
      }
    } catch (error) {
      dispatch(showError({ title: 'Failed to save key', error }));
      return;
    } finally {
      dispatch({ type: KEY_SAVED, payload: { keyName: savedKey, isSaveSucceeded, revisionHistory } });
    }

    if (isNewKey) dispatch({ type: 'KEY_ADDED', payload: savedKey });
    const shouldOpenNewKey = isNewKey && getState().selectedKey.key === BLANK_KEY_NAME;

    if (shouldOpenNewKey) {
      dispatch(push(`/keys/${savedKey}`));
    }
  };
}

const setValidationHintsVisibility = (validationState, isShown) => {
  Object.keys(validationState)
    .map(x => validationState[x])
    .filter(x => typeof x === 'object')
    .map((x) => {
      setValidationHintsVisibility(x, isShown);
      return x;
    })
    .filter(x => x.isValid === false)
    .forEach((x) => {
      x.isShowingHint = isShown;
      setValidationHintsVisibility(x, isShown);
    });
};

const handleKeyOpened = (state, { payload: { key, revisionHistory, ...keyData } }) => {
  let validation;
  if (key !== BLANK_KEY_NAME) {
    validation = {
      isValid: true,
    };
  } else {
    validation = {
      key: keyNameValidations(key, []),
      manifest: {
        valueType: keyValueTypeValidations(keyData.manifest.valueType),
      },
      isValid: false,
    };
  }

  setValidationHintsVisibility(validation, false);

  return {
    local: R.clone(keyData),
    remote: R.clone(keyData),
    revisionHistory,
    key,
    isLoaded: true,
    validation,
  };
};

const handleKeyOpening = (state, { payload: { key } }) => ({
  key,
  isLoaded: false,
});

const handleKeyRuleDefUpdated = (state, { payload }) => ({
  ...state,
  local: {
    ...state.local,
    keyDef: { ...state.local.keyDef, ...payload },
  },
});

const handleKeyManifestUpdated = (state, { payload }) => ({
  ...state,
  local: {
    ...state.local,
    manifest: payload,
  },
});

const handleKeySaved = (
  { local, remote, ...state },
  { payload: { keyName, isSaveSucceeded, revisionHistory } },
) => {
  if (state.key !== BLANK_KEY_NAME && state.key !== keyName) return state;
  return {
    ...state,
    isSaving: false,
    local,
    remote: isSaveSucceeded ? R.clone(local) : remote,
    revisionHistory: isSaveSucceeded && revisionHistory ? revisionHistory : state.revisionHistory,
  };
};

const handleKeySaving = ({ ...state }) => ({
  ...state,
  isSaving: true,
});

const handleKeyNameChange = ({ local: { key, ...localData }, ...otherState }, { payload }) => ({
  ...otherState,
  local: {
    ...localData,
    manifest: { ...localData.manifest, meta: { ...localData.manifest.meta, name: payload } },
    ...(payload === '' ? {} : { key: payload }),
  },
});

const isStateInvalid = validationState =>
  Object.keys(validationState)
    .map(x => validationState[x])
    .filter(x => typeof x === 'object')
    .some(x => x.isValid === false || isStateInvalid(x));

const handleKeyValidationChange = ({ ...state }, { payload }) => {
  const isKeyInvalid = isStateInvalid(payload);
  return {
    ...state,
    validation: {
      ...payload,
      isValid: !isKeyInvalid,
    },
  };
};

const handleKeyDeleting = ({ remote, ...otherState }) => ({
  ...otherState,
  local: { ...remote },
  remote: { ...remote },
});

const handleKeyValueTypeChange = ({ local: { manifest, ...restOfLocal }, ...state }, { payload }) => ({
  ...state,
  local: {
    ...restOfLocal,
    manifest: {
      ...manifest,
      valueType: payload,
    },
  },
});

const handleShowKeyValidations = ({ validation, ...state }) => {
  setValidationHintsVisibility(validation, true);
  return {
    ...state,
    validation,
  };
};

export default handleActions(
  {
    [KEY_OPENED]: handleKeyOpened,
    [KEY_OPENING]: handleKeyOpening,
    [KEY_RULEDEF_UPDATED]: handleKeyRuleDefUpdated,
    [KEY_MANIFEST_UPDATED]: handleKeyManifestUpdated,
    [KEY_SAVED]: handleKeySaved,
    [KEY_SAVING]: handleKeySaving,
    [KEY_NAME_CHANGE]: handleKeyNameChange,
    [KEY_VALIDATION_CHANGE]: handleKeyValidationChange,
    KEY_DELETING: handleKeyDeleting,
    [KEY_VALUE_TYPE_CHANGE]: handleKeyValueTypeChange,
    [SHOW_KEY_VALIDATIONS]: handleShowKeyValidations,
  },
  null,
);

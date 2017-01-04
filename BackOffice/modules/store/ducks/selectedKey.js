import { handleActions } from 'redux-actions';
import R from 'ramda';
import { push } from 'react-router-redux';
import { createBlankKey, BLANK_KEY_NAME } from './ducks-utils/blankKeyDefinition';
import { withJsonData } from '../../utils/http';
import keyNameValidations from './ducks-utils/key-name-validations';

const KEY_OPENED = 'KEY_OPENED';
const KEY_OPENING = 'KEY_OPENING';
const KEY_RULEDEF_UPDATED = 'KEY_RULEDEF_UPDATED';
const KEY_RULE_META_UPDATED = 'KEY_RULE_META_UPDATED';
const KEY_SAVED = 'KEY_SAVED';
const KEY_SAVING = 'KEY_SAVING';
const KEY_NAME_CHANGE = 'KEY_NAME_CHANGE';
const KEY_VALIDATION_CHANGE = 'KEY_VALIDATION_CHANGE';

export function openKey(key) {
    return async function (dispatch) {
        if (key === BLANK_KEY_NAME) {
            dispatch({ type: KEY_OPENED, payload: createBlankKey() });
            return;
        }

        dispatch({ type: KEY_OPENING, payload: key });

        try {
            const keyData = await (await fetch(`/api/keys/${key}`, { credentials: 'same-origin' })).json();

            const keyOpenedPayload = {
                key,
                meta: keyData.meta,
                keyDef: keyData.keyDef,
            };

            dispatch({ type: KEY_OPENED, payload: keyOpenedPayload });
        } catch (exp) {
            let keyOpenedPayload = {
                key,
                meta: null,
                keyDef: null,
            };

            dispatch({ type: KEY_OPENED, payload: keyOpenedPayload });
        }
    };
}

export function updateKeyDef(keyDef) {
    return { type: KEY_RULEDEF_UPDATED, payload: keyDef };
}

export function updateKeyMetaDef(meta) {
    return { type: KEY_RULE_META_UPDATED, payload: meta };
}

export function updateKeyName(newKeyName) {
    return async function (dispatch, getState) {
        dispatch({ type: KEY_NAME_CHANGE, payload: newKeyName });

        var validationResult = keyNameValidations(newKeyName, getState().keys);
        dispatch({ type: KEY_VALIDATION_CHANGE, payload: validationResult });
    };
}

export function saveKey() {
    return async function (dispatch, getState) {
        const { selectedKey: { local, key } } = getState();
        const isNewKey = !!(local.key);
        const savedKey = local.key || key;

        dispatch({ type: KEY_SAVING });

        await fetch(`/api/keys/${savedKey}`, {
            credentials: 'same-origin',
            method: 'put',
      ...withJsonData(local),
    });

    dispatch({ type: KEY_SAVED, payload: savedKey });

    if (isNewKey) dispatch({ type: 'KEY_ADDED', payload: savedKey });
    const shouldOpenNewKey = isNewKey && getState().selectedKey.key === BLANK_KEY_NAME;

    if (shouldOpenNewKey) {
        dispatch(push(`/keys/${savedKey}`));
    }
};
}

const handleKeyOpened = (state, { payload: { key, ...props } }) => {
    const validation = key !== BLANK_KEY_NAME ? undefined : {
        key: { isValid: false, }
    };

    return {
        key,
        isLoaded: true,
        local: R.clone(props),
        remote: R.clone(props),
        validation,
    };
};

const handleKeyOpening = (state, { payload: { key } }) => {
    return {
        key,
        isLoaded: false,
    };
};

const handleKeyRuleDefUpdated = (state, { payload }) => ({
  ...state,
    local: {
    ...state.local,
        keyDef: { ...state.local.keyDef, ...payload },
},
});

const handleKeyMetaUpdated = (state, { payload }) => ({
    ...state,
    local: {
      ...state.local,
        meta: payload,
    },
});

const handleKeySaved = (state, { payload }) => {
    return state.key === payload ?
        { ...state, isSaving: false, } :
        ({...state });
};

const handleKeySaving = ({ local, ...otherState }) => ({
    ...otherState,
    isSaving: true,
    local,
    remote: R.clone(local),
});

const handleKeyNameChange = ({ local: { key, ...localData }, ...otherState }, { payload }) => ({
    ...otherState,
    local: {
        ...localData,
        meta: { ...localData.meta, displayName: payload },
        ...(payload === '' ? {} : { key: payload }),
},
});

const handleKeyValidationChange = ({ validation, ...otherState }, { payload }) => ({
    ...otherState,
    validation: {
        ...validation,
        key: {...payload },
    }
});

const handleKeyDeleting = ({ remote, ...otherState }) => {
    return ({
    ...otherState,
        local: {...remote },
        remote: { ...remote },
    });
};

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
}, null);
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
    await openKey(savedKey);
    dispatch({ type: KEY_SAVED });
};
}

const handleKeyOpened = (state, { payload: { key, ...props } }) => {
    return {
        key,
        isLoaded: true,
        local: R.clone(props),
        remote: R.clone(props),
    };
};

const handleKeyOpening = (state, { payload: { key, ...props } }) => {
    return {
        key,
        isLoaded: false,
        local: R.clone(props),
        remote: R.clone(props),
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

const handleKeySaved = ({ local: { key, ...localData }, ...otherState }) => ({
    key,
      ...otherState,
    local: localData,
    remote: R.clone(localData),
    isSaving: false,
});

const handleKeySaving = (state) => ({
    ...state,
    isSaving: true,
});

const handleKeyNameChange = ({ local: { key, ...localData }, ...otherState }, { payload }) => ({
    ...otherState,
    local: {
        ...localData,
        meta: { ...localData.meta, displayName: payload },
        ...(payload === '' ? {} : { key: payload }), // get displayName from payload
},
});

const handleKeyValidationChange = ({ validation, ...otherState }, { payload }) => ({
    ...otherState,
    validation: {
        ...validation,
        key: {...payload },
    }
});

export default handleActions({
    [KEY_OPENED]: handleKeyOpened,
    [KEY_OPENING]: handleKeyOpening,
    [KEY_RULEDEF_UPDATED]: handleKeyRuleDefUpdated,
    [KEY_RULE_META_UPDATED]: handleKeyMetaUpdated,
    [KEY_SAVED]: handleKeySaved,
    [KEY_SAVING]: handleKeySaving,
    [KEY_NAME_CHANGE]: handleKeyNameChange,
    [KEY_VALIDATION_CHANGE]: handleKeyValidationChange,
}, null);
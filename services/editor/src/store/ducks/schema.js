import { push } from 'connected-react-router';
import jsonpatch from 'fast-json-patch';
import * as R from 'ramda';
import { handleActions } from 'redux-actions';
import { getSchema, refreshSchema } from '../../services/context-service';
import { showError, tweekManagementClient } from '../../utils';

const SCHEMA_LOADED = 'SCHEMA_LOADED';
const UPSERT_SCHEMA_PROPERTY = 'SCHEMA_UPSERT_PROPERTY';
const REMOVE_SCHEMA_PROPERTY = 'SCHEMA_REMOVE_PROPERTY';
const SCHEMA_SAVED = 'SCHEMA_SAVED';
const SAVING_SCHEMA = 'SAVING_SCHEMA';
const ADD_NEW_IDENTITY = 'ADD_NEW_IDENTITY';
const DELETING_IDENTITY = 'DELETING_IDENTITY';
const IDENTITY_DELETED = 'IDENTITY_DELETED';

function handleError(message, thunkFn) {
  return async (dispatch, ...args) => {
    try {
      return await thunkFn(dispatch, ...args);
    } catch (ex) {
      showError(ex, message);
    }
  };
}

export function loadSchema() {
  return { type: SCHEMA_LOADED };
}

export function saveSchema(identityType) {
  return handleError(`failed to save changes for ${identityType}`, async (dispatch, getState) => {
    let identityState = getState().schema[identityType];
    dispatch({ type: SAVING_SCHEMA, value: { identity: identityType } });
    if (identityState.remote === null) {
      await tweekManagementClient.saveIdentity(identityType, identityState.local);
    } else {
      let patch = jsonpatch.compare(identityState.remote, identityState.local);
      await tweekManagementClient.patchIdentity(identityType, patch);
    }
    dispatch({ type: SCHEMA_SAVED, value: { identity: identityType } });
    await refreshSchema();
  });
}

export function removeIdentityProperty(identity, prop) {
  return { type: REMOVE_SCHEMA_PROPERTY, value: { identity, prop } };
}

export function upsertIdentityProperty(identity, prop, value) {
  return { type: UPSERT_SCHEMA_PROPERTY, value: { identity, prop, value } };
}

export function addNewIdentity(identityType) {
  return (dispatch) => {
    dispatch({ type: ADD_NEW_IDENTITY, value: { identityType } });
    dispatch(push(`/settings/identities/${identityType}`));
  };
}

export function deleteIdentity(identityType) {
  return handleError(`Failed to delete identity ${identityType}`, async (dispatch) => {
    dispatch(push(`/settings`));
    dispatch({ type: DELETING_IDENTITY, value: { identityType } });
    await tweekManagementClient.deleteIdentity(identityType);
    dispatch({ type: IDENTITY_DELETED, value: { identityType } });
  });
}

function createRemoteAndLocalStates(state) {
  return { local: state, remote: state, isSaving: false };
}

function createSchemaState() {
  return R.map(createRemoteAndLocalStates)(getSchema());
}

export default handleActions(
  {
    [DELETING_IDENTITY]: (state, { value: { identityType } }) =>
      R.dissocPath([identityType])(state),
    [SCHEMA_LOADED]: (state, action) => createSchemaState(),
    [REMOVE_SCHEMA_PROPERTY]: (state, { value: { identity, prop } }) =>
      R.dissocPath([identity, 'local', prop])(state),
    [UPSERT_SCHEMA_PROPERTY]: (state, { value: { identity, prop, value } }) =>
      R.assocPath([identity, 'local', prop], value)(state),
    [SCHEMA_SAVED]: (state, { value: { identity } }) =>
      R.pipe(
        R.assocPath([identity, 'remote'], state[identity].local),
        R.assocPath([identity, 'isSaving'], false),
      )(state),
    [SAVING_SCHEMA]: (state, { value: { identity } }) =>
      R.assocPath([identity, 'isSaving'], true)(state),
    [ADD_NEW_IDENTITY]: (state, { value: { identityType } }) =>
      R.assocPath([identityType], {
        local: {},
        remote: null,
        isSaving: false,
      })(state),
  },
  [],
);

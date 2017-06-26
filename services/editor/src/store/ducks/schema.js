import { handleActions } from 'redux-actions';
import { getSchema, refreshSchema } from '../../services/context-service';
import R from 'ramda';
import jsondiffpatch from 'jsondiffpatch';
import { withJsonData } from '../../utils/http';

const SCHEMA_LOADED = 'SCHEMA_LOADED';
const UPSERT_SCHEMA_PROPERTY = 'SCHEMA_UPSERT_PROPERTY';
const REMOVE_SCHEMA_PROPERTY = 'SCHEMA_REMOVE_PROPERTY';
const IDENTITY_SELECTED = 'IDENTITY_SELECTED';
const SCHEMA_SAVED = 'SCHEMA_SAVED';
const SAVING_SCHEMA = 'SAVING_SCHEMA';

export function loadSchema() {
  return { type: SCHEMA_LOADED };
}

export function saveSchema(identityType) {
  return async (dispatch, getState) => {
    let identityState = getState().schema[identityType];
    let patch = jsondiffpatch.diff(identityState.remote, identityState.local);
    dispatch({ type: SAVING_SCHEMA, value: { identity: identityType } });
    await fetch(`/api/schema/${identityType}`, {
      credentials: 'same-origin',
      method: 'PATCH',
      ...withJsonData(patch),
    });
    dispatch({ type: SCHEMA_SAVED, value: { identity: identityType } });
    await refreshSchema();
  };
}

export function removeIdentityProperty(identity, prop) {
  return { type: REMOVE_SCHEMA_PROPERTY, value: { identity, prop } };
}

export function upsertIdentityProperty(identity, prop, value) {
  return { type: UPSERT_SCHEMA_PROPERTY, value: { identity, prop, value } };
}

function createRemoteAndLocalStates(state) {
  return { local: state, remote: state };
}

function createSchemaState() {
  return R.map(createRemoteAndLocalStates)(getSchema());
}

export default handleActions(
  {
    [SCHEMA_LOADED]: (state, action) => createSchemaState(),
    [IDENTITY_SELECTED]: (state, action) => ({ selectedIdentity: action.identity, ...state }),
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
  },
  [],
);

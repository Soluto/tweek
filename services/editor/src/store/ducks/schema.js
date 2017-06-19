import { handleActions } from 'redux-actions';
import { getSchema } from '../../services/context-service';
import R from 'ramda';
import jsondiffpatch from 'jsondiffpatch';
import { withJsonData } from '../../utils/http';

const SCHEMA_LOADED = 'SCHEMA_LOADED';
const UPDATE_SCHEMA_PROPERTY = 'SCHEMA_UPDATE_PROPERTY';
const IDENTITY_SELECTED = 'IDENTITY_SELECTED';

export function loadSchema() {
  return { type: SCHEMA_LOADED };
}

export function saveSchema(identityType) {
  return async (dispatch, getState) => {
    let identityState = getState().schema[identityType];
    let patch = jsondiffpatch.diff(identityState.remote, identityState.local);
    return dispatch(
      await fetch(`/api/schema/${identityType}`, {
        credentials: 'same-origin',
        method: 'PATCH',
        ...withJsonData(patch),
      }),
    );
  };
}

export function updateIdentityProperty(identity, prop, value) {
  return { type: UPDATE_SCHEMA_PROPERTY, value: { identity, prop, value } };
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
    [UPDATE_SCHEMA_PROPERTY]: (state, { value: { identity, prop, value } }) => ({
      ...state,
      [identity]: {
        ...state[identity],
        local: { ...state[identity].local, [prop]: value },
      },
    }),
  },
  [],
);

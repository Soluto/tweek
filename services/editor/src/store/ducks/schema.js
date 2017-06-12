import { handleActions } from 'redux-actions';
import { getSchmea } from '../../services/context-service';
import R from 'ramda';

const SCHEMA_LOADED = 'SCHEMA_LOADED';
const UPDATE_SCHEMA_PROPERTY = 'SCHEMA_UPDATE_PROPERTY';
const IDENTITY_SELECTED = 'IDENTITY_SELECTED';

export function loadSchema() {
  return { type: SCHEMA_LOADED };
}

//const findAndUpdate = idSelector => newItem => arr => R.update(R.findIndex(R.eqBy(idSelector)(newItem), arr), newItem, arr);
//const propUpdater = findAndUpdate(x => x.id);

export function updateIdentityProperty(identity, prop, value) {
  return { type: UPDATE_SCHEMA_PROPERTY, value: { identity, prop, value } };
}

function createRemoteAndLocalStates(state) {
  return { local: state, remote: state };
}

function createSchemaState() {
  return R.map(createRemoteAndLocalStates)(getSchmea());
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

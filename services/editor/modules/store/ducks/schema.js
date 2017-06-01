import { handleActions } from 'redux-actions';
import { getIdentities, getProperties } from '../../services/context-service';
import R from 'ramda';

const SCHEMA_LOADED = 'SCHEMA_LOADED';
const UPDATE_SCHEMA_PROPERTY = 'SCHEMA_UPDATE_PROPERTY';

export function loadSchema() {
  return ({ type: SCHEMA_LOADED });
}

const findAndUpdate = idSelector => newItem => arr => R.update(R.findIndex(R.eqBy(idSelector)(newItem), arr), newItem, arr);
const propUpdater = findAndUpdate(x => x.id);

export default handleActions({
  [SCHEMA_LOADED]: (state, action) => ({ identities: getIdentities(), properties: getProperties() }),
  [UPDATE_SCHEMA_PROPERTY]: (state, { value }) => ({ ...state, identities: propUpdater(value, state.identities) }),
}, []);

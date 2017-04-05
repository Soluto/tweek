import { handleActions } from 'redux-actions';
import { getIdentities, getProperties } from "../../services/context-service";

const SCHEMA_LOADED = 'SCHEMA_LOADED';

export function loadSchema() {
  return ({ type: SCHEMA_LOADED });
}

export default handleActions({
  [SCHEMA_LOADED]: ({state, action}) => ({ identities: getIdentities(), properties: getProperties() }),
}, []);

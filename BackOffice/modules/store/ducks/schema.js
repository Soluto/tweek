import {handleActions} from 'redux-actions';
import {GetSchema} from '../../services/tweek-api';
import changeCase from 'change-case';
import R from 'ramda';

const SCHEMA_REFRESH = "SCHEMA_REFRESH";

const mapKeys = R.curry((fn, obj) =>
  R.fromPairs(R.map(R.adjust(fn, 0), R.toPairs(obj))));

export function refreshSchemaInfo() {
  return async function (dispatch) {
    let schemaDetails = await GetSchema();
    let processedSchemaDetails = {};

    for (let identity in schemaDetails) {
      if (schemaDetails.hasOwnProperty(identity)) {
        processedSchemaDetails[identity] = mapKeys(changeCase.pascalCase, schemaDetails[identity]);
      }
    }

    dispatch({type: SCHEMA_REFRESH, payload: processedSchemaDetails})
  }
}

export default handleActions({
  [SCHEMA_REFRESH]: (state, {payload}) => payload,
}, {});


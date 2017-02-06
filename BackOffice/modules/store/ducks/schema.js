import {handleActions} from 'redux-actions';
import changeCase from 'change-case';
import R from 'ramda';

const SCHEMA_REFRESH = "SCHEMA_REFRESH";

const mapKeys = R.curry((fn, obj) =>
  R.fromPairs(R.map(R.adjust(fn, 0), R.toPairs(obj))));

export function refreshSchemaInfo() {
  return async function (dispatch, getState) {
    let tweekApiHostname = getState().config["TWEEK_API_HOSTNAME"];
    let response = await fetch(`${tweekApiHostname}/configurations/@tweek/context/_?$ignoreKeyTypes=false`);
    let schemaDetails = await response.json();
    let processedSchemaDetails = {};

    for (let identity of Object.keys(schemaDetails)) {
        processedSchemaDetails[identity] = mapKeys(changeCase.pascalCase, schemaDetails[identity]);
    }

    dispatch({type: SCHEMA_REFRESH, payload: processedSchemaDetails})
  }
}

export default handleActions({
  [SCHEMA_REFRESH]: (state, {payload}) => payload,
}, {});


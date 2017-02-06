import {handleActions} from "redux-actions";

const SET_CONFIGURATIONS = "SET_CONFIGURATIONS";

export function setConfigurations(configs){
  return async function (dispatch){
    await dispatch({type: SET_CONFIGURATIONS, payload: configs});
  }
}


export default handleActions({
  [SET_CONFIGURATIONS]: (state, {payload}) => Object.assign({}, state, payload),
}, {});


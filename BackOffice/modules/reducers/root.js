import {combineReducers} from "redux";
import {routerReducer} from "react-router-redux";
import keysReducer from "../pages/keys/reducers/keys";
import selectedKeyReducer from "../pages/keys/reducers/selectedKey";

export default (combineReducers(
    {
        keys: keysReducer,
        selectedKey: selectedKeyReducer,
        routing: routerReducer
    }
))
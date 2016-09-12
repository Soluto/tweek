import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import keysReducer from '../pages/keys/ducks/keys';
import selectedKeyReducer from '../pages/keys/ducks/selectedKey';
import tagsReducer from '../pages/keys/ducks/tags';

export default (combineReducers(
  {
    keys: keysReducer,
    selectedKey: selectedKeyReducer,
    routing: routerReducer,
    tags: tagsReducer,
  }
));

import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';
import schemaReducer from './ducks/schema';

const createRootReducer = (history) =>
  combineReducers({
    router: connectRouter(history),
    schema: schemaReducer,
  });

export default createRootReducer;

import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';
import contextReducer from './ducks/context';
import schemaReducer from './ducks/schema';

const createRootReducer = (history) =>
  combineReducers({
    router: connectRouter(history),
    context: contextReducer,
    schema: schemaReducer,
  });

export default createRootReducer;

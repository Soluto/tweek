import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import keysReducer from './ducks/keys';
import selectedKeyReducer from './ducks/selectedKey';
import alertsReducer from './ducks/alerts';
import schemaReducer from './ducks/schema';
import contextReducer from './ducks/context';

const createRootReducer = (history) =>
  combineReducers({
    keys: keysReducer,
    selectedKey: selectedKeyReducer,
    router: connectRouter(history),
    alerts: alertsReducer,
    context: contextReducer,
    schema: schemaReducer,
  });

export default createRootReducer;

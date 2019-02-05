import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import keysReducer from './ducks/keys';
import selectedKeyReducer from './ducks/selectedKey';
import tagsReducer from './ducks/tags';
import notificationsReducer from './ducks/notifications';
import alertsReducer from './ducks/alerts';
import schemaReducer from './ducks/schema';
import contextReducer from './ducks/context';

export default (history) =>
  combineReducers({
    keys: keysReducer,
    selectedKey: selectedKeyReducer,
    router: connectRouter(history),
    tags: tagsReducer,
    notifications: notificationsReducer,
    alerts: alertsReducer,
    context: contextReducer,
    schema: schemaReducer,
  });

import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import keysReducer from './ducks/keys';
import selectedKeyReducer from './ducks/selectedKey';
import tagsReducer from './ducks/tags';
import notificationsReducer from './ducks/notifications';
import alertsReducer from './ducks/alerts';
import schemaReducer from './ducks/schema';
import contextReducer from './ducks/context';

export default combineReducers({
  keys: keysReducer,
  selectedKey: selectedKeyReducer,
  routing: routerReducer,
  tags: tagsReducer,
  notifications: notificationsReducer,
  alerts: alertsReducer,
  context: contextReducer,
  schema: schemaReducer,
});

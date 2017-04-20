import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import keysReducer from './ducks/keys';
import historyReducer from './ducks/history';
import selectedKeyReducer from './ducks/selectedKey';
import tagsReducer from './ducks/tags';
import notificationsReducer from './ducks/notifications';
import alertsReducer from './ducks/alerts'

export default (combineReducers(
  {
    keys: keysReducer,
    history: historyReducer,
    selectedKey: selectedKeyReducer,
    routing: routerReducer,
    tags: tagsReducer,
    notifications: notificationsReducer,
    alerts: alertsReducer,
  }
));

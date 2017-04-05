import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import keysReducer from './ducks/keys';
import selectedKeyReducer from './ducks/selectedKey';
import tagsReducer from './ducks/tags';
import notificationsReducer from './ducks/notifications';
import alertsReducer from './ducks/alerts'
import identitiesReducer from './ducks/identities'

export default (combineReducers(
  {
    keys: keysReducer,
    selectedKey: selectedKeyReducer,
    routing: routerReducer,
    tags: tagsReducer,
    notifications: notificationsReducer,
    alerts: alertsReducer,
    identities: identitiesReducer,
  }
));

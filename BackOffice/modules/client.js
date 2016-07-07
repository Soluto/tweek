import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import routes from '../modules/routes';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

window.Pref = require('react-addons-perf');

let store = configureStore(window.STORE_INITIAL_STATE);

import { syncHistoryWithStore } from 'react-router-redux';

const history = syncHistoryWithStore(browserHistory, store);

render(
  <Provider store={store}>
    <Router onUpdate={() => window.scrollTo(0, 0)} history={history} routes={routes()}/>
  </Provider>
  ,
  document.getElementById('app')
);


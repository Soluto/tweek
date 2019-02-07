/* global document */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store, ReduxContext } from './store';
import Routes from './Routes';
import 'papp-polyfill';

ReactDOM.render(
  <Provider store={store}>
    <ReduxContext.Provider value={store}>
      <Routes />
    </ReduxContext.Provider>
  </Provider>
  ,
  document.getElementById('root'),
);

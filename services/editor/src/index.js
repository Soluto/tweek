/* global document */
import React, { createContext } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import Routes from './Routes';
import 'papp-polyfill';


const store = configureStore({});
export const ReduxContext = createContext();

ReactDOM.render(
  <Provider store={store}>
    <ReduxContext.Provider value={store}>
      <Routes />
    </ReduxContext.Provider>
  </Provider>
  ,
  document.getElementById('root'),
);

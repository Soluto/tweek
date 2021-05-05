import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { AlertsProvider } from './contexts/Alerts';
import { store } from './store';
import Routes from './Routes';
import 'papp-polyfill';

ReactDOM.render(
  <Provider store={store}>
    <AlertsProvider>
      <Routes />
    </AlertsProvider>
  </Provider>,
  document.getElementById('root'),
);

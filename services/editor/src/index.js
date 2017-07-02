import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import configureStore from './store/configureStore';
import Routes from './Routes';
import registerServiceWorker, { unregister } from './registerServiceWorker';
import { refreshTypes } from './services/types-service';
import { refreshSchema } from './services/context-service';
import { getKeys } from './store/ducks/keys';
require('papp-polyfill');
import fetch from './utils/fetch';

injectTapEventPlugin();

let store = configureStore({});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.onmessage = ({ data: { type } }) => {
    if (type === 'refresh') {
      refreshTypes();
      refreshSchema();
      store.dispatch(getKeys());
    }
  };
}

ReactDOM.render(
  <Provider store={store}>
    <Routes />
  </Provider>,
  document.getElementById('root'),
);

fetch('/api/editor-configuration/service_worker/is_enabled').then(x => x.json()).then((enabled) => {
  if (enabled) {
    console.log('enabling service worker');
    registerServiceWorker();
  } else {
    console.log('service worker is disabled');
    unregister();
  }
});

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import configureStore from './store/configureStore';
import Routes from './Routes';
import registerServiceWorker from './registerServiceWorker';
import { refreshTypes } from './services/types-service';
import { refreshSchema } from './services/context-service';
import { getKeys } from './store/ducks/keys';
require('papp-polyfill');

injectTapEventPlugin();

let store = configureStore({});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.onmessage = ({ data: { type } }) => {
    switch (type) {
    case 'cache-cleared':
      refreshTypes();
      refreshSchema();
      break;
    case 'manifests':
      store.dispatch(getKeys());
      break;
    }
  };
}

ReactDOM.render(
  <Provider store={store}>
    <Routes />
  </Provider>,
  document.getElementById('root'),
);

registerServiceWorker();

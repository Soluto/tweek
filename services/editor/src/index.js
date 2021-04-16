/* global document */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Routes from './Routes';
import 'papp-polyfill';
import { Global, css } from '@emotion/react';

ReactDOM.render(
  <>
    <Global
      styles={css`
        html {
          overflow: hidden;
        }
      `}
    />
    <Provider store={store}>
      <Routes />
    </Provider>
  </>,
  document.getElementById('root'),
);

import React from 'react';
import { createServer } from 'react-project/server';
import { RouterContext } from 'react-router';
import Document from '../modules/components/Document';
import routes from '../modules/routes';
import configureStore from './store/configureStore';
import { Provider } from 'react-redux';
import serverRoutes from './serverRoutes';

const repo = require('./repo/rulesRepo')
           .init({ url: 'http://tweek-gogs.07965c2a.svc.dockerapp.io/tweek/tweek-rules', username: 'tweek', password: '***REMOVED***' });

function getApp(req, res, requestCallback) {
  requestCallback(null, {
    routes: routes(serverRoutes({ repo })),
    render(routerProps, renderCallback) {
      const store = configureStore({});
      repo.getAllRules().then(keys => store.dispatch({ type: 'KEYS_UPDATED', payload: keys }))
      .then(() =>
        renderCallback(null, {
          renderDocument: (props) => <Document {...props} initialState={store.getState()} />,
          renderApp: (props) =>
              <Provider store={store}><RouterContext {...props} repo={repo} /></Provider>,
        })
      );
    },
  });
}

createServer(getApp).start();


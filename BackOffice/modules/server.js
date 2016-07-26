import React from 'react';
import { createServer } from 'react-project/server';
import { RouterContext } from 'react-router';
import Document from '../modules/components/Document';
import routes from '../modules/routes';
import configureStore from './store/configureStore';
import { Provider } from 'react-redux';
import serverRoutes from './serverRoutes';
import { getKeys } from '../modules/pages/keys/ducks/keys';
import GitRepository from './server/repositories/GitRepository';
import MetaRepository from './server/repositories/MetaRepository';
import RulesRepository from './server/repositories/RulesRepository';

const gitRepo = GitRepository.init({
  url: 'http://tweek-gogs.07965c2a.svc.dockerapp.io/tweek/tweek-rules',
  username: 'tweek',
  password: '***REMOVED***',
  localPath: `${process.cwd()}/rulesRepository`,
});

const rulesRepository = new RulesRepository(gitRepo);
const metaRepository = new MetaRepository(gitRepo);

function getApp(req, res, requestCallback) {
  requestCallback(null, {
    routes: routes(serverRoutes({ rulesRepository, metaRepository })),
    render(routerProps, renderCallback) {
      const store = configureStore({});
      rulesRepository.getAllRules().then(keys => store.dispatch(getKeys(keys)))
        .then(() =>
          renderCallback(null, {
            renderDocument: (props) => <Document {...props} initialState={store.getState() } />,
            renderApp: (props) =>
              <Provider store={store}><RouterContext {...props} metaRepository={metaRepository} rulesRepository={rulesRepository} /></Provider>,
          })
        );
    },
  });
}

createServer(getApp).start();


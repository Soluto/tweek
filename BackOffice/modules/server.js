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
import session from 'express-session';
import Transactional from "./utils/transact";
import { getBasePathForKeys, getKeyFromJPadPath} from "./server/repositories/gitPathsUtils";
import gitContinuousPull from "./server/repositories/gitContinuousPull";
const passport = require('passport');
const nconf = require('nconf');


nconf.argv()
  .env();

const configFileName = true || nconf.get('NODE_ENV') === 'production' ?
  'tweek_config_prod.json' : 'tweek_config_test.json';

nconf.file({ file: `${process.cwd()}/${configFileName}` });

var gitPromise = GitRepository.create({
  url: nconf.get('GIT_URL'),
  username: nconf.get('GIT_USER'),
  password: nconf.get('GIT_PASSWORD'),
  localPath: `${process.cwd()}/rulesRepository`
});

const gitTransactionManager = new Transactional(gitPromise);

gitContinuousPull(gitTransactionManager);

function getApp(req, res, requestCallback) {
  requestCallback(null, {
    routes: routes(serverRoutes({ gitTransactionManager })),
    async render(routerProps, renderCallback) {

      const store = configureStore({});
      const keys = await gitTransactionManager.transact(async gitRepo => {
        const keyFiles = await gitRepo.listFiles(getBasePathForKeys());
        return keyFiles.map(keyFile => getKeyFromJPadPath(keyFile));
      });

      await store.dispatch(getKeys(keys));

      renderCallback(null, {
        renderDocument: (props) => <Document {...props} initialState={store.getState()} />,
        renderApp: (props) =>
          <Provider store={store}><RouterContext {...props} /></Provider>,
      });
    },
  });
}

const server = createServer(getApp);
server.use(session({ secret: 'some-secret' }));
const azureADAuthProvider = require('./server/auth/azuread');
if ((nconf.get('REQUIRE_AUTH') || '').toLowerCase() === 'true') {
  server.use(passport.initialize());
  server.use(passport.session());

  const authProviders = [azureADAuthProvider(server, nconf)];
  server.use('/login', function (req, res) {
    res.send(authProviders.map(x => `<a href="${x.url}">login with ${x.name}</a>`).join(''));
  });

  server.use('*', function (req, res, next) {
    if (req.isAuthenticated() || req.path.startsWith('auth')) {
      return next();
    }
    return res.redirect('/login');
  });
}

server.start();


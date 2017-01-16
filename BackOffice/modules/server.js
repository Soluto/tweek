import React from 'react';
import { createServer } from 'react-project/server';
import { RouterContext } from 'react-router';
import Document from '../modules/components/Document';
import routes from '../modules/routes';
import configureStore from './store/configureStore';
import { Provider } from 'react-redux';
import serverRoutes from './serverRoutes';
import { getKeys } from './store/ducks/keys';
import GitRepository from './server/repositories/git-repository';
import session from 'express-session';
import Transactor from './utils/transactor';
import KeysRepository from './server/repositories/keys-repository';
import TagsRepository from './server/repositories/tags-repository';
import TypesRepository from './server/repositories/types-repository';
import GitContinuousUpdater from './server/repositories/git-continuous-updater';
const passport = require('passport');
const nconf = require('nconf');

nconf.argv().env().file({ file: `${process.cwd()}/config.json` });

const gitUrl = nconf.get('GIT_URL');
const gitUsername = nconf.get('GIT_USER');
const gitPassword = nconf.get('GIT_PASSWORD');

if (!gitUrl ||
  !gitUsername ||
  !gitPassword) {
  throw 'missing rules repostiroy details';
}

const gitRepostoryConfig = {
  url: gitUrl,
  username: gitUsername,
  password: gitPassword,
  localPath: `${process.cwd()}/rulesRepository`,
};

const gitPromise = GitRepository.create(gitRepostoryConfig);

const gitTransactionManager = new Transactor(gitPromise, async gitRepo => await gitRepo.reset());
const keysRepository = new KeysRepository(gitTransactionManager);
const tagsRepository = new TagsRepository(gitTransactionManager);
const typesRepository = new TypesRepository(gitTransactionManager);

GitContinuousUpdater.start(gitTransactionManager);

function getApp(req, res, requestCallback) {
  requestCallback(null, {
    routes: routes(serverRoutes({ tagsRepository, keysRepository, typesRepository })),
    async render(routerProps, renderCallback) {

      const store = configureStore({});
      const keys = await keysRepository.getAllKeys();
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


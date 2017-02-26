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
import GitContinuousUpdater from './server/repositories/git-continuous-updater';
import Promise from 'bluebird';
const passport = require('passport');
const nconf = require('nconf');
const azureADAuthProvider = require('./server/auth/azuread');

nconf.argv().env().file({ file: `${process.cwd()}/config.json` });
nconf.required(['GIT_URL', 'GIT_USER', 'GIT_PASSWORD', 'TWEEK_API_HOSTNAME', 'GIT_CLONE_TIMEOUT_IN_MINUTES']);
const gitCloneTimeoutInMinutes = nconf.get('GIT_CLONE_TIMEOUT_IN_MINUTES');
const tweekApiHostname = nconf.get('TWEEK_API_HOSTNAME');

const gitRepostoryConfig = {
  url: nconf.get('GIT_URL'),
  username: nconf.get('GIT_USER'),
  password: nconf.get('GIT_PASSWORD'),
  localPath: `${process.cwd()}/rulesRepository`,
};

const gitRepoCreationPromise = GitRepository.create(gitRepostoryConfig);
const gitRepoCreationPromiseWithTimeout = new Promise((resolve, reject) => {
  gitRepoCreationPromise.then(() => resolve());
})
  .timeout(gitCloneTimeoutInMinutes * 60 * 1000)
  .catch(Promise.TimeoutError, () => {
    throw `git repository clonning timeout after ${gitCloneTimeoutInMinutes} minutes`;
  });

const gitTransactionManager = new Transactor(gitRepoCreationPromise, async gitRepo => await gitRepo.reset());
const keysRepository = new KeysRepository(gitTransactionManager);
const tagsRepository = new TagsRepository(gitTransactionManager);

GitContinuousUpdater.start(gitTransactionManager);

function getApp(req, res, requestCallback) {
  requestCallback(null, {
    routes: routes(serverRoutes({ tagsRepository, keysRepository, tweekApiHostname })),
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

const addAuthSupport = (server) => {
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

const startServer = () => {
  const server = createServer(getApp);
  server.use(session({ secret: 'some-secret' }));
  if ((nconf.get('REQUIRE_AUTH') || '').toLowerCase() === 'true') {
    addAuthSupport(server);
  }

  server.start();
};

gitRepoCreationPromiseWithTimeout
  .then(() => console.log('starting tweek server'))
  .then(() => startServer())
  .catch(reason => {
    console.error(reason);
    process.exit();
  });
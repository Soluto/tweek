import React from 'react';
import { createServer } from 'react-project/server';
import { RouterContext } from 'react-router';
import Document from '../modules/components/Document';
import routes from '../modules/routes';
import configureStore from './store/configureStore';
import { Provider } from 'react-redux';
import serverRoutes from './serverRoutes';
import { getKeys } from './store/ducks/keys';
import { refreshSchemaInfo } from './store/ducks/schema';
import { setConfigurations } from './store/ducks/config';
import GitRepository from './server/repositories/git-repository';
import session from 'express-session';
import Transactor from './utils/transactor';
import KeysRepository from './server/repositories/keys-repository';
import TagsRepository from './server/repositories/tags-repository';
import TypesRepository from './server/repositories/types-repository';
import GitContinuousUpdater from './server/repositories/git-continuous-updater';
import Promise from 'bluebird';
const passport = require('passport');
const nconf = require('nconf');
const azureADAuthProvider = require('./server/auth/azuread');

nconf.argv().env().file({ file: `${process.cwd()}/config.json` });
nconf.required(['GIT_URL', 'GIT_USER', 'GIT_PASSWORD', 'TWEEK_API_HOSTNAME', 'GIT_CLONE_TIMEOUT_IN_MINUTES']);
const gitUrl = nconf.get('GIT_URL');
const gitUsername = nconf.get('GIT_USER');
const gitPassword = nconf.get('GIT_PASSWORD');
const tweekApiHostname = nconf.get('TWEEK_API_HOSTNAME');
const gitCloneTimeoutInMinutes = nconf.get('GIT_CLONE_TIMEOUT_IN_MINUTES');

const gitRepostoryConfig = {
  url: gitUrl,
  username: gitUsername,
  password: gitPassword,
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
const typesRepository = new TypesRepository(gitTransactionManager);

GitContinuousUpdater.start(gitTransactionManager);

function getApp(req, res, requestCallback) {
  requestCallback(null, {
    routes: routes(serverRoutes({ tagsRepository, keysRepository, typesRepository })),
    async render(routerProps, renderCallback) {

      const store = configureStore({});
      const keys = await keysRepository.getAllKeys();
      await store.dispatch(getKeys(keys));
      await store.dispatch(setConfigurations({
        "TWEEK_API_HOSTNAME": nconf.get('TWEEK_API_HOSTNAME')
      }));
      await store.dispatch(refreshSchemaInfo());

      renderCallback(null, {
        renderDocument: (props) => <Document {...props} initialState={store.getState()} />,
        renderApp: (props) =>
          <Provider store={store}><RouterContext {...props} /></Provider>,
      });
    },
  });
}

const startServer = () => {
  const server = createServer(getApp);
  server.use(session({ secret: 'some-secret' }));
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
};

gitRepoCreationPromiseWithTimeout
  .then(() => startServer())
  .catch(reason => {
    console.error(reason);
    process.exit();
  });
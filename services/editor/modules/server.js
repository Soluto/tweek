import React from 'react';
import createServer from './server/createServer';
import { RouterContext } from 'react-router';
import Document from '../modules/components/Document';
import routes from '../modules/routes';
import path from 'path';
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
const crypto = require('crypto');

nconf.argv().env().file({ file: `${process.cwd()}/config.json` }).defaults({ GIT_CLONE_TIMEOUT_IN_MINUTES: 1, TWEEK_API_HOSTNAME: 'https://api.playground.tweek.host' });
nconf.required(['GIT_URL', 'GIT_USER']);
const gitCloneTimeoutInMinutes = nconf.get('GIT_CLONE_TIMEOUT_IN_MINUTES');
const tweekApiHostname = nconf.get('TWEEK_API_HOSTNAME');

const toFullPath = x => path.normalize(path.isAbsolute(x) ? x : `${process.cwd()}/${x}`);

const gitRepostoryConfig = {
  url: nconf.get('GIT_URL'),
  username: nconf.get('GIT_USER'),
  password: nconf.get('GIT_PASSWORD'),
  localPath: `${process.cwd()}/rulesRepository`,
  publicKey: toFullPath(nconf.get('GIT_PUBLIC_KEY_PATH') || ''),
  privateKey: toFullPath(nconf.get('GIT_PRIVATE_KEY_PATH') || ''),
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

GitContinuousUpdater.onUpdate(gitTransactionManager)
  .subscribe();

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
};

const startServer = () => {
  const server = createServer(getApp);
  const cookieOptions = {
    secret: nconf.get('SESSION_COOKIE_SECRET_KEY') || crypto.randomBytes(20).toString('base64'),
    cookie: { httpOnly: true },
  };
  server.use(session(cookieOptions));
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
    //process.exit();
  });

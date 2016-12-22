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
import Transactor from "./utils/transactor";
import KeysRepository from './server/repositories/keys-repository';
import TagsRepository from "./server/repositories/tags-repository";
import gitContinuousPull from "./server/repositories/gitContinuousPull";
const passport = require('passport');
const nconf = require('nconf');


const optionalConfigFileName = 'config.json';
nconf.argv()
  .file({ file: `${process.cwd()}/${optionalConfigFileName}` })
  .env();

const gitRepostoryConfig = {
  url: nconf.get('GIT_URL'),
  username: nconf.get('GIT_USER'),
  password: nconf.get('GIT_PASSWORD'),
  localPath: `${process.cwd()}/rulesRepository`
};

const gitPromise = GitRepository.create(gitRepostoryConfig);

const gitTransactionManager = new Transactor(gitPromise, async gitRepo => await gitRepo.reset());
const gitContinuousPullPromise = gitContinuousPull(gitTransactionManager);
const keysRepository = new KeysRepository(gitTransactionManager);
const tagsRepository = new TagsRepository(gitTransactionManager);

function getApp(req, res, requestCallback) {
  requestCallback(null, {
    routes: routes(serverRoutes({ tagsRepository, keysRepository })),
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


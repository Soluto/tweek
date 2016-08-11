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
import TagsRepository from './server/repositories/TagsRepository';
import session from 'express-session';
const passport = require('passport');
const nconf = require('nconf');

nconf.argv()
   .env()
   .file({ file: `${process.cwd()}/tweek_config.json` });

console.log(nconf.get('GIT_URL'));

const gitRepo = GitRepository.init({
  url: nconf.get('GIT_URL'),
  username: nconf.get('GIT_USER'),
  password: nconf.get('GIT_PASSWORD'),
  localPath: `${process.cwd()}/rulesRepository`,
});

const rulesRepository = new RulesRepository(gitRepo);
const metaRepository = new MetaRepository(gitRepo);
const tagsRepository = new TagsRepository(gitRepo);

function getApp(req, res, requestCallback) {
  requestCallback(null, {
    routes: routes(serverRoutes({ rulesRepository, metaRepository, tagsRepository })),
    render(routerProps, renderCallback) {
      const store = configureStore({});
      rulesRepository.getAllRules().then(keys => store.dispatch(getKeys(keys)))
        .then(() =>
          renderCallback(null, {
            renderDocument: (props) => <Document {...props} initialState={store.getState() } />,
            renderApp: (props) =>
              <Provider store={store}><RouterContext {...props} /></Provider>,
          })
        );
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


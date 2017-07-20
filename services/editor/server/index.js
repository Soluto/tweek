import path from 'path';
import http from 'http';
import express from 'express';
import morgan from 'morgan';
import nconf from 'nconf';
import session from 'express-session';
import Promise from 'bluebird';
import bodyParser from 'body-parser';
import Rx from 'rxjs';
import webpush from 'web-push';
import serverRoutes from './serverRoutes';
import GitRepository from './repositories/git-repository';
import Transactor from './utils/transactor';
import KeysRepository from './repositories/keys-repository';
import TagsRepository from './repositories/tags-repository';
import GitContinuousUpdater from './repositories/git-continuous-updater';
import searchIndex from './searchIndex';
import * as Registration from './api/registration';
import getVapidKeys from './getVapidKeys';

const crypto = require('crypto');
const passport = require('passport');
const selectAuthenticationProviders = require('./auth/providerSelector')
  .selectAuthenticationProviders;

nconf.argv().env().defaults({
  PORT: 3001,
  GIT_CLONE_TIMEOUT_IN_MINUTES: 1,
  TWEEK_API_HOSTNAME: 'http://api.dev.local.tweek.fm:81',
  VAPID_KEYS: './vapid/keys.json',
});
nconf.required(['GIT_URL', 'GIT_USER']);

const PORT = nconf.get('PORT');
const gitCloneTimeoutInMinutes = nconf.get('GIT_CLONE_TIMEOUT_IN_MINUTES');
const tweekApiHostname = nconf.get('TWEEK_API_HOSTNAME');

const toFullPath = x => path.normalize(path.isAbsolute(x) ? x : `${process.cwd()}/${x}`);

const gitRepositoryConfig = {
  url: nconf.get('GIT_URL'),
  username: nconf.get('GIT_USER'),
  password: nconf.get('GIT_PASSWORD'),
  localPath: `${process.cwd()}/rulesRepository`,
  publicKey: toFullPath(nconf.get('GIT_PUBLIC_KEY_PATH') || ''),
  privateKey: toFullPath(nconf.get('GIT_PRIVATE_KEY_PATH') || ''),
};

const gitRepoCreationPromise = GitRepository.create(gitRepositoryConfig);
const gitRepoCreationPromiseWithTimeout = Promise.resolve(gitRepoCreationPromise)
  .timeout(gitCloneTimeoutInMinutes * 60 * 1000)
  .catch(Promise.TimeoutError, () => {
    throw `git repository cloning timeout after ${gitCloneTimeoutInMinutes} minutes`;
  });

const gitTransactionManager = new Transactor(gitRepoCreationPromise, gitRepo => gitRepo.reset());
const keysRepository = new KeysRepository(gitTransactionManager);
const tagsRepository = new TagsRepository(gitTransactionManager);

GitContinuousUpdater.onUpdate(gitTransactionManager)
  .map(_ => Registration.notifyClients())
  .exhaustMap(_ =>
    Rx.Observable.defer(() => searchIndex.refreshIndex(gitRepositoryConfig.localPath)),
  )
  .do(_ => console.log('index was refreshed'), err => console.log('error refreshing index', err))
  .retry()
  .subscribe();

function addDirectoryTraversalProtection(server) {
  const DANGEROUS_PATH_PATTERN = /(?:^|[\\/])\.\.(?:[\\/]|$)/;
  server.use('*', (req, res, next) => {
    if (req.path.includes('\0') || DANGEROUS_PATH_PATTERN.test(req.path)) {
      return res.status(400).send({ error: 'Dangerous path' });
    }
    return next();
  });
}

function addAuthSupport(server) {
  server.use(passport.initialize());
  server.use(passport.session());

  const authProviders = selectAuthenticationProviders(server, nconf);
  server.use('/login', (req, res) => {
    res.send(authProviders.map(x => `<a href="${x.url}">login with ${x.name}</a>`).join('<br/>'));
  });

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  server.use('*', (req, res, next) => {
    if (req.isAuthenticated() || req.path.startsWith('auth')) {
      return next();
    }
    if (req.originalUrl.startsWith('/api/')) {
      return res.sendStatus(403);
    }
    return res.redirect('/login');
  });
}

const startServer = async () => {
  const vapidKeys = await getVapidKeys();
  webpush.setVapidDetails('http://tweek.host', vapidKeys.publicKey, vapidKeys.privateKey);

  const app = express();
  const server = http.Server(app);

  app.use(morgan('tiny'));

  addDirectoryTraversalProtection(app);
  const cookieOptions = {
    secret: nconf.get('SESSION_COOKIE_SECRET_KEY') || crypto.randomBytes(20).toString('base64'),
    cookie: { httpOnly: true },
  };
  app.use(session(cookieOptions));
  if ((nconf.get('REQUIRE_AUTH') || '').toLowerCase() === 'true') {
    addAuthSupport(app);
  }
  app.use(bodyParser.json()); // for parsing application/json
  app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

  app.use('/api', serverRoutes({ tagsRepository, keysRepository, tweekApiHostname }));

  app.use(express.static(path.join(__dirname, 'build')));
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  app.use((err, req, res, next) => {
    console.error(req.method, res.originalUrl, err);
    res.status(500).send(err.message);
  });

  server.listen(PORT, () => console.log('Listening on port %d', server.address().port));
};

gitRepoCreationPromiseWithTimeout
  .then(() => console.log('starting tweek server'))
  .then(() => startServer())
  .catch((reason) => {
    console.error(reason);
    // process.exit();
  });

import path from 'path';
import http from 'http';
import express from 'express';
import morgan from 'morgan';
import nconf from 'nconf';
import session from 'express-session';
import bodyParser from 'body-parser';
import webpush from 'web-push';
import serverRoutes from './serverRoutes';
import GitContinuousUpdater from './utils/continuous-updater';
import * as Registration from './api/registration';
import getVapidKeys from './getVapidKeys';
import helmet from 'helmet';
import fs from 'fs';
import os from 'os';
const crypto = require('crypto');
const passport = require('passport');
const selectAuthenticationProviders = require('./auth/providerSelector')
  .selectAuthenticationProviders;

function useFileFromBase64EnvVariable(inlineKeyName, fileKeyName) {
  const tmpDir = os.tmpdir();
  if (nconf.get(inlineKeyName) && !nconf.get(fileKeyName)) {
    const keyData = new Buffer(nconf.get(inlineKeyName), 'base64');
    const newKeyPath = `${tmpDir}/${fileKeyName}`;
    fs.writeFileSync(newKeyPath, keyData);
    nconf.set(fileKeyName, newKeyPath);
  }
}

nconf
  .use('memory')
  .argv()
  .env()
  .defaults({
    PORT: 3001,
    TWEEK_API_HOSTNAME: 'http://api',
    AUTHORING_API_HOSTNAME: 'http://authoring:3000',
    MANAGEMENT_HOSTNAME: 'http://management:3000',
    VAPID_KEYS: './vapid/keys.json',
  });

useFileFromBase64EnvVariable('GIT_PRIVATE_KEY_INLINE', 'GIT_PRIVATE_KEY_PATH');

const PORT = nconf.get('PORT');
const serviceEndpoints = {
  api: nconf.get('TWEEK_API_HOSTNAME'),
  authoring: nconf.get('AUTHORING_API_HOSTNAME'),
  management: nconf.get('MANAGEMENT_HOSTNAME'),
};

GitContinuousUpdater.onUpdate(serviceEndpoints.authoring)
  .map(_ => Registration.notifyClients())
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
  app.use(helmet());
  app.disable('x-powered-by');

  app.use(morgan('tiny'));

  addDirectoryTraversalProtection(app);
  const cookieOptions = {
    secret: nconf.get('SESSION_COOKIE_SECRET_KEY') || crypto.randomBytes(20).toString('base64'),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
    },
  };
  app.use(session(cookieOptions));
  if ((nconf.get('REQUIRE_AUTH') || '').toLowerCase() === 'true') {
    addAuthSupport(app);
  }
  app.use(bodyParser.json()); // for parsing application/json
  app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

  app.use('/api', serverRoutes({ serviceEndpoints }));
  app.use('/health', (req, res) => res.status(200).json({}));
  app.get('/version', (req, res) => res.send(process.env.npm_package_version));

  app.use(express.static(path.join(__dirname, 'build')));
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  app.use((err, req, res, next) => {
    console.error(req.method, res.originalUrl, err.message);
    res.status(500).send(err.message);
  });

  server.listen(PORT, () => console.log('Listening on port %d', server.address().port));
};

startServer().catch((reason) => {
  console.error(reason);
  // process.exit();
});

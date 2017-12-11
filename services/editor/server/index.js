import path from 'path';
import http from 'http';
import express from 'express';
import morgan from 'morgan';
import nconf from 'nconf';
import bodyParser from 'body-parser';
import webpush from 'web-push';
import serverRoutes from './serverRoutes';
import GitContinuousUpdater from './utils/continuous-updater';
import * as Registration from './api/registration';
import getVapidKeys from './getVapidKeys';
import helmet from 'helmet';
import fs from 'fs';
import os from 'os';

import { authMiddleware, initAuth, addLoginRedirect } from './authSupport';
import addDirectoryTraversalProtection from './directoryProtection';

const useFileFromBase64EnvVariable = (inlineKeyName, fileKeyName) => {
  const tmpDir = os.tmpdir();
  if (nconf.get(inlineKeyName) && !nconf.get(fileKeyName)) {
    const keyData = new Buffer(nconf.get(inlineKeyName), 'base64');
    const newKeyPath = `${tmpDir}/${fileKeyName}`;
    fs.writeFileSync(newKeyPath, keyData);
    nconf.set(fileKeyName, newKeyPath);
  }
};

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

const startServer = async () => {
  const vapidKeys = await getVapidKeys();
  webpush.setVapidDetails('http://tweek.host', vapidKeys.publicKey, vapidKeys.privateKey);

  const app = express();
  const server = http.Server(app);
  app.use(helmet());
  app.disable('x-powered-by');

  app.use(morgan('tiny'));

  addDirectoryTraversalProtection(app);

  initAuth(app);

  app.use(bodyParser.json()); // for parsing application/json
  app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

  app.use('/api', authMiddleware, serverRoutes({ serviceEndpoints }));
  app.get('/version', (req, res) => res.send(process.env.npm_package_version));
  app.use('/health', (req, res) => res.status(200).json({}));

  const sendBundle = (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html'));
  addLoginRedirect(app, sendBundle, '/', '/login');
  app.use(express.static(path.join(__dirname, 'build')));
  addLoginRedirect(app, sendBundle, '*', '/login');

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

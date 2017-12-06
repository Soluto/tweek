import path = require('path');
import BluebirdPromise = require('bluebird');
import express = require('express');
import morgan = require('morgan');
import bodyParser = require('body-parser');
import { Observable } from 'rxjs';
import fs = require('fs-extra');
import passport = require('passport');
import Transactor from './utils/transactor';
import GitRepository from './repositories/git-repository';
import KeysRepository from './repositories/keys-repository';
import TagsRepository from './repositories/tags-repository';
import AppsRepository from './repositories/apps-repository';
import GitContinuousUpdater from './repositories/git-continuous-updater';
import searchIndex from './search-index';
import routes from './routes';
import configurePassport from './security/configure-passport';
import sshpk = require('sshpk');
import { ErrorRequestHandler } from 'express';
import { Server } from 'typescript-rest';

const {
  PORT,
  GIT_URL,
  GIT_USER,
  GIT_PASSWORD,
  GIT_PUBLIC_KEY_PATH,
  GIT_PRIVATE_KEY_PATH,
  GIT_CLONE_TIMEOUT_IN_MINUTES,
} = require('./constants');

const toFullPath = (x: string) => path.normalize(path.isAbsolute(x) ? x : `${process.cwd()}/${x}`);

const gitRepositoryConfig = {
  url: GIT_URL,
  username: GIT_USER,
  password: GIT_PASSWORD,
  localPath: `${process.cwd()}/rulesRepository`,
  publicKey: toFullPath(GIT_PUBLIC_KEY_PATH),
  privateKey: toFullPath(GIT_PRIVATE_KEY_PATH),
};

const gitRepoCreationPromise = GitRepository.create(gitRepositoryConfig);
const gitRepoCreationPromiseWithTimeout = BluebirdPromise.resolve(gitRepoCreationPromise)
  .timeout(GIT_CLONE_TIMEOUT_IN_MINUTES * 60 * 1000)
  .catch(BluebirdPromise.TimeoutError, () => {
    throw new Error(`git repository cloning timeout after ${GIT_CLONE_TIMEOUT_IN_MINUTES} minutes`);
  });

const gitTransactionManager = new Transactor(gitRepoCreationPromise, gitRepo => gitRepo.reset());
const keysRepository = new KeysRepository(gitTransactionManager);
const tagsRepository = new TagsRepository(gitTransactionManager);
const appsRepository = new AppsRepository(gitTransactionManager);

const auth = passport.authenticate(['tweek-internal', 'apps-credentials'], { session: false });

async function startServer() {
  await appsRepository.refresh();
  const app = express();
  const publicKey = sshpk
    .parseKey(await fs.readFile(gitRepositoryConfig.publicKey), 'auto')
    .toBuffer('pem');
  app.use(morgan('tiny'));
  app.use(configurePassport(publicKey, appsRepository));
  app.use(bodyParser.json()); // for parsing application/json
  app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
  app.get('/version', (req, res) => res.send(process.env.npm_package_version));
  app.get('/health', (req, res) => res.status(200).json({}));
  app.use('/api', auth, routes({ tagsRepository, keysRepository, appsRepository }));

  Server.swagger(app, './dist/swagger.json', 'swagger');

  app.use('/*', (req, res) => res.sendStatus(404));
  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(req.method, req.originalUrl, err.message);
    res.status(err.statusCode || 500).send(err.message);
  };
  app.use(errorHandler);

  app.listen(PORT, () => console.log('Listening on port', PORT));
}

const onUpdate$ = GitContinuousUpdater.onUpdate(gitTransactionManager).share();

onUpdate$
  .switchMapTo(Observable.defer(() => searchIndex.refreshIndex(gitRepositoryConfig.localPath)))
  .do(null, (err: any) => console.error('Error refreshing index', err))
  .retry()
  .subscribe();

onUpdate$
  .switchMapTo(Observable.defer(() => appsRepository.refresh()))
  .do(null, (err: any) => console.error('Error refersing apps index', err))
  .retry()
  .subscribe();

gitRepoCreationPromiseWithTimeout.then(async () => await startServer()).catch((reason: any) => {
  console.error(reason);
});

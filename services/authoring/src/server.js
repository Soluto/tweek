const path = require('path');
const Promise = require('bluebird');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const Rx = require('rxjs');
const Transactor = require('./utils/transactor');
const GitRepository = require('./repositories/git-repository');
const KeysRepository = require('./repositories/keys-repository');
const TagsRepository = require('./repositories/tags-repository');
const AppsRepository = require('./repositories/apps-repository');
const GitContinuousUpdater = require('./repositories/git-continuous-updater');
const passport = require('passport');
const searchIndex = require('./search-index');
const routes = require('./routes');
const fs = require('fs-extra');
const configurePassport = require('./security/configure-passport');
const sshpk = require('sshpk');

const {
  PORT,
  GIT_URL,
  GIT_USER,
  GIT_PASSWORD,
  GIT_PUBLIC_KEY_PATH,
  GIT_PRIVATE_KEY_PATH,
  GIT_CLONE_TIMEOUT_IN_MINUTES,
} = require('./constants');

const toFullPath = x => path.normalize(path.isAbsolute(x) ? x : `${process.cwd()}/${x}`);

const gitRepositoryConfig = {
  url: GIT_URL,
  username: GIT_USER,
  password: GIT_PASSWORD,
  localPath: `${process.cwd()}/rulesRepository`,
  publicKey: toFullPath(GIT_PUBLIC_KEY_PATH),
  privateKey: toFullPath(GIT_PRIVATE_KEY_PATH),
};

const gitRepoCreationPromise = GitRepository.create(gitRepositoryConfig);
const gitRepoCreationPromiseWithTimeout = Promise.resolve(gitRepoCreationPromise)
  .timeout(GIT_CLONE_TIMEOUT_IN_MINUTES * 60 * 1000)
  .catch(Promise.TimeoutError, () => {
    throw `git repository cloning timeout after ${GIT_CLONE_TIMEOUT_IN_MINUTES} minutes`;
  });

const gitTransactionManager = new Transactor(gitRepoCreationPromise, gitRepo => gitRepo.reset());
const keysRepository = new KeysRepository(gitTransactionManager);
const tagsRepository = new TagsRepository(gitTransactionManager);
const appsRepository = new AppsRepository(gitTransactionManager);

async function startServer() {
  await appsRepository.refresh();
  const app = express();
  const publicKey = sshpk
    .parseKey(await fs.readFile(gitRepositoryConfig.publicKey))
    .toBuffer('pem');
  app.use(morgan('tiny'));
  app.use(configurePassport(publicKey, appsRepository));
  app.use(bodyParser.json()); // for parsing application/json
  app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
  app.use(routes({ tagsRepository, keysRepository, appsRepository }));
  app.use('/*', (req, res) => res.sendStatus(404));
  app.use((err, req, res, next) => {
    console.error(req.method, res.originalUrl, err);
    res.status(500).send(err.message);
  });

  app.listen(PORT, () => console.log('Listening on port', PORT));
}

GitContinuousUpdater.onUpdate(gitTransactionManager)
  .switchMap(_ =>
    Rx.Observable.defer(() => searchIndex.refreshIndex(gitRepositoryConfig.localPath)),
  )
  .do(() => {}, err => console.error('Error refreshing index', err))
  .retry()
  .subscribe();

//GitContinuousUpdater.onUpdate(gitTransactionManager)
//  .switchMap(_ => Rx.Observable.defer(() => searchIndex.refreshIndex(gitRepositoryConfig.localPath)))
//  .do(()=>{}, err => console.error('Error refersing apps index', err))
//  .retry()
//  .subscribe();

gitRepoCreationPromiseWithTimeout.then(() => startServer()).catch((reason) => {
  console.error(reason);
});

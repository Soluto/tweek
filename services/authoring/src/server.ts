import path from 'path';
import BluebirdPromise from 'bluebird';
import express from 'express';
import { defer } from 'rxjs';
import { retry, share, switchMapTo, tap } from 'rxjs/operators';
import fs from 'fs-extra';
import passport from 'passport';
import Transactor from './utils/transactor';
import requestLogger from './utils/requestLogger';
import logger from './utils/logger';
import GitRepository, { RepoOutOfDateError } from './repositories/git-repository';
import KeysRepository from './repositories/keys-repository';
import TagsRepository from './repositories/tags-repository';
import AppsRepository from './repositories/apps-repository';
import PolicyRepository from './repositories/policy-repository';
import GitContinuousUpdater from './repositories/git-continuous-updater';
import searchIndex from './search-index';
import routes from './routes';
import configurePassport from './security/configure-passport';
import sshpk from 'sshpk';
import { ErrorRequestHandler } from 'express';
import { getErrorStatusCode } from './utils/error-utils';
import SubjectExtractionRulesRepository from './repositories/extraction-rules-repository';

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

const gitTransactionManager = new Transactor<GitRepository>(
  gitRepoCreationPromise,
  async (gitRepo) => {
    await gitRepo.reset();
    await gitRepo.fetch();
    await gitRepo.mergeMaster();
  },
  (function() {
    let retries = 2;
    return async (error, context) => {
      if (retries-- === 0) {
        return false;
      }
      if (error instanceof RepoOutOfDateError) {
        return true;
      }
      return false;
    };
  })(),
);

const keysRepository = new KeysRepository(gitTransactionManager);
const tagsRepository = new TagsRepository(gitTransactionManager);
const appsRepository = new AppsRepository(gitTransactionManager);
const policyRepository = new PolicyRepository(gitTransactionManager);
const resourcePolicyRepository = new PolicyRepository(gitTransactionManager);
const subjectExtractionRulesRepository = new SubjectExtractionRulesRepository(
  gitTransactionManager,
);

const auth = passport.authenticate(['tweek-internal', 'apps-credentials'], { session: false });

async function startServer() {
  await appsRepository.refresh();
  const app = express();
  const publicKey = sshpk
    .parseKey(await fs.readFile(gitRepositoryConfig.publicKey), 'auto')
    .toBuffer('pem');
  app.use(requestLogger);
  app.use(configurePassport(publicKey, appsRepository));
  app.use(express.json()); // for parsing application/json
  app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
  app.get('/version', (req, res) => res.send(process.env.npm_package_version));
  app.get('/health', (req, res) => res.status(200).json({}));
  app.use(
    '/api',
    auth,
    routes({
      tagsRepository,
      keysRepository,
      appsRepository,
      policyRepository,
      subjectExtractionRulesRepository,
    }),
  );

  app.use('/*', (req, res) => {
    if (!res.headersSent) {
      res.sendStatus(404);
    }
  });

  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (!res.headersSent) {
      res.status(getErrorStatusCode(err)).send(err.message);
    }

    logger.error({ Method: req.method, Url: req.originalUrl, err }, err.message);
  };
  app.use(errorHandler);

  app.listen(PORT, () => logger.info({ port: PORT }, 'server started'));
}

const onUpdate$ = GitContinuousUpdater.onUpdate(gitTransactionManager).pipe(share());

onUpdate$
  .pipe(
    switchMapTo(defer(() => searchIndex.refreshIndex(gitRepositoryConfig.localPath))),
    tap({ error: (err) => logger.error({ err }, 'Error refreshing search index') }),
    retry(),
  )
  .subscribe();

onUpdate$
  .pipe(
    switchMapTo(defer(() => appsRepository.refresh())),
    tap({ error: (err) => logger.error({ err }, 'Error refreshing apps index') }),
    retry(),
  )
  .subscribe();

gitRepoCreationPromiseWithTimeout.then(startServer).catch((reason: any) => {
  logger.error({ err: reason }, 'failed starting server');
  process.exit(1);
});

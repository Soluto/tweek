const fs = require('fs');
const os = require('os');
const uuid = require('uuid/v4');
const Git = require('nodegit');
const nconf = require('nconf');
const { promisify } = require('util');
const recursive = promisify(require('recursive-readdir'));
const mkdirp = promisify(require('mkdirp'));
const NATS = require('nats');
const readFile = promisify(fs.readFile);
const buildRulesArtifiact = require('./build-rules-artifiact');
const logger = require('./logger');
const initStorage = require('./object-storage');

function useFileFromBase64EnvVariable(inlineKeyName, fileKeyName) {
  const tmpDir = os.tmpdir();
  if (nconf.get(inlineKeyName) && !nconf.get(fileKeyName)) {
    const keyData = new Buffer(nconf.get(inlineKeyName), 'base64');
    const newKeyPath = `${tmpDir}/${fileKeyName}`;
    fs.writeFileSync(newKeyPath, keyData);
    nconf.set(fileKeyName, newKeyPath);
  }
}

useFileFromBase64EnvVariable('GIT_PUBLIC_KEY_INLINE', 'GIT_PUBLIC_KEY_PATH');
useFileFromBase64EnvVariable('GIT_PRIVATE_KEY_INLINE', 'GIT_PRIVATE_KEY_PATH');
nconf.required(['GIT_URL', 'GIT_USER']);

const gitUrl = nconf.get('GIT_URL');
const gitUser = nconf.get('GIT_USER');
const gitPassword = nconf.get('GIT_PASSWORD');
const gitPublicKey = nconf.get('GIT_PUBLIC_KEY_PATH');
const gitPrivateKey = nconf.get('GIT_PRIVATE_KEY_PATH');
const gitSampleInterval = +nconf.get('GIT_SAMPLE_INTERVAL');
const repoPath = `${process.env.RULES_DIR || os.tmpdir()}/tweek-rules-${uuid()}`;

logger.info(`Repository path: ${repoPath}`);

const fetchOpts = {
  callbacks: {
    credentials: () =>
      gitUrl.startsWith('ssh://')
        ? Git.Cred.sshKeyNew(gitUser, gitPublicKey, gitPrivateKey, '')
        : Git.Cred.userpassPlaintextNew(gitUser, gitPassword),
  },
};

const rulesCache = {
  ruleset: null,
  formattedRuleset: null,
  sha: null,
};

function delay(timeInMilliseconds) {
  return new Promise(resolve => setTimeout(resolve, timeInMilliseconds));
}

async function buildLocalCache() {
  await mkdirp(repoPath);
  await Git.Clone.clone(gitUrl, repoPath, { fetchOpts: fetchOpts });
  logger.info('Git repository ready');

  const storage = await initStorage();

  return updateLatestCache(storage);
}

async function syncRepo(repo) {
  await repo.fetchAll(fetchOpts);
  await repo.mergeBranches('master', 'origin/master');

  const remoteCommit = await repo.getBranchCommit('remotes/origin/master');
  const localCommit = await repo.getBranchCommit('master');

  if (remoteCommit.id().equal(localCommit.id()) === 1) return;

  console.warn('Repo is not synced after pull');
  await Git.Reset.reset(repo, remoteCommit, Git.Reset.TYPE.HARD);
}

async function updateLatestCache({ updateStorage } = {}) {
  let nats;
  const natsEndpoint = nconf.get('NATS_ENDPOINT');
  if (natsEndpoint) {
    nats = NATS.connect(nconf.get('NATS_ENDPOINT'));
    nats.on('error', e => console.error('nats error', e));
  }

  while (true) {
    try {
      const repo = await Git.Repository.open(repoPath);
      await syncRepo(repo);

      const newLatestSha = (await repo.getMasterCommit()).sha();

      if (newLatestSha === rulesCache.sha) {
        nats && nats.publish('version', newLatestSha);
        await delay(gitSampleInterval);
        continue;
      }
      console.log('change detected');

      const fileNames = await recursive(repoPath);
      const fileHandlers = fileNames.map(file => ({
        name: file.substr(repoPath.length + 1),
        read: () => readFile(file, 'utf8'),
      }));
      const ruleset = await buildRulesArtifiact(fileHandlers);

      let timer = logger.startTimer();
      const formattedRuleset = JSON.stringify(ruleset);
      timer.done('updateLatestCache:JSON.stringify');

      if (updateStorage) {
        timer = logger.startTimer();
        await updateStorage(newLatestSha, formattedRuleset);
        timer.done('updateLatestCache:updateBucket');
      }

      rulesCache.sha = newLatestSha;
      rulesCache.ruleset = ruleset;
      rulesCache.formattedRuleset = formattedRuleset;

      logger.info('Rules Cache updated', { sha: newLatestSha });

      nats && nats.publish('version', newLatestSha);
    } catch (err) {
      console.error(err);
      await delay(gitSampleInterval);
    }
  }
}

module.exports = {
  buildLocalCache,
  getLatestRules: () => rulesCache.ruleset,
  getLatestFormattedRules: () => rulesCache.formattedRuleset,
  getLatestRulesVersion: () => rulesCache.sha,
};

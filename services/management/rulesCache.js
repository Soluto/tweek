const fs = require('fs');
const os = require('os');
const Guid = require('guid');
const Git = require('nodegit');
const nconf = require('nconf');
const promisify = require('util').promisify;
const recursive = promisify(require('recursive-readdir'));
const mkdirp = promisify(require('mkdirp'));
const readFile = promisify(fs.readFile);
const buildRulesArtifiact = require('./build-rules-artifiact');

const logger = require('./logger');

nconf.argv().env().file({ file: `${process.cwd()}/config.json` });

const gitUrl = nconf.get('GIT_URL');
const gitUser = nconf.get('GIT_USER');
const gitPassword = nconf.get('GIT_PASSWORD');
const gitPublicKey = nconf.get('GIT_PUBLIC_KEY_PATH');
const gitPrivateKey = nconf.get('GIT_PRIVATE_KEY_PATH');

if (!gitUrl || !gitUser) {
  throw 'missing rules repostiroy details';
}

const repoPath = `${process.env.RULES_DIR || os.tmpdir()}/tweek-rules-${Guid.raw()}`;

logger.info('Repository path: ' + repoPath);

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
  sha: null,
};

function delay(timeInMilliseconds) {
  return new Promise(resolve => setTimeout(resolve, timeInMilliseconds));
}

async function buildLocalCache() {
  await mkdirp(repoPath);
  await Git.Clone.clone(gitUrl, repoPath, { fetchOpts: fetchOpts });
  logger.info('Git repository ready');
  return updateLatestCache();
}

async function updateLatestCache() {
  while (true) {
    try {
      const repo = await Git.Repository.open(repoPath);
      await repo.fetchAll(fetchOpts);
      await repo.mergeBranches('master', 'origin/master');

      const newLatestSha = (await repo.getMasterCommit()).sha();

      if (newLatestSha === rulesCache.sha) {
        await delay(5000);
        continue;
      }
      console.log('change detected');

      const fileNames = await recursive(repoPath);
      const fileHandlers = fileNames.map(file => ({
        name: file.substr(repoPath.length + 1),
        read: () => readFile(file, 'utf8'),
      }));
      const ruleset = await buildRulesArtifiact(fileHandlers);

      rulesCache.sha = newLatestSha;
      rulesCache.ruleset = ruleset;
      logger.info('Rules Cache updated', { sha: newLatestSha });
    } catch (err) {
      console.error(err);
      await delay(5000);
    }
  }
}

module.exports = {
  buildLocalCache,
  getLatestRules: () => rulesCache.ruleset,
  getLatestRulesVersion: () => rulesCache.sha,
};

const Promise = require('bluebird');
const fs = require('fs');
const os = require('os');
const Guid = require('guid');
const Git = require("nodegit");
const _ = require('lodash');
const nconf = require('nconf');

const recursive = Promise.promisify(require('recursive-readdir'));
const mkdirp = Promise.promisify(require('mkdirp'));
const readFile = Promise.promisify(fs.readFile);

const logger = require('./logger');

nconf.argv().env().file({ file: `${process.cwd()}/config.json` });

const gitUrl = nconf.get('GIT_URL');
const gitUser = nconf.get('GIT_USER');
const gitPassword = nconf.get('GIT_PASSWORD');
const gitPublicKey = nconf.get('GIT_PUBLIC_KEY_PATH');
const gitPrivateKey = nconf.get('GIT_PRIVATE_KEY_PATH');

if (!gitUrl ||
    !gitUser) {
    throw 'missing rules repostiroy details';
}

const repoPath = `${process.env.RULES_DIR || os.tmpdir()}/tweek-rules-${Guid.raw()}`;
const rulesHome = repoPath + '/rules/';

logger.info('Repository path: ' + repoPath);

var fetchOpts = {
    callbacks: {
        credentials: () => gitUrl.startsWith('ssh://') ? Git.Cred.sshKeyNew(gitUser, gitPublicKey, gitPrivateKey, '')
                                                         : Git.Cred.userpassPlaintextNew(gitUser, gitPassword),
    }
};

var rulesCache = {
    ruleset: null,
    sha: null
};

function buildLocalCache() {
    mkdirp(repoPath)
        .then(() => Git.Clone.clone(gitUrl, repoPath, { fetchOpts: fetchOpts }))
        .then(() => logger.info('Git repository ready'))
        .then(() => updateLatestCache());
}

const updateLatestCache = Promise.coroutine(function* () {
    while (true) {
        try {
            const repo = yield Git.Repository.open(repoPath);
            yield repo.fetchAll(fetchOpts);
            const oid = yield repo.mergeBranches('master', 'origin/master');

            const newLatestSha = (yield repo.getMasterCommit()).sha();

            if (newLatestSha === rulesCache.sha) {
                yield Promise.delay(5000);
                continue;
            }
            console.log("change detected")

            const files = yield recursive(rulesHome);
            const pairs = yield createContentByFilenames(files);
            const ruleset = _.fromPairs(pairs);

            rulesCache.sha = newLatestSha;
            rulesCache.ruleset = ruleset;
            logger.info('Rules Cache updated', { sha: newLatestSha });
        }
        catch (err) {
            console.error(err);
            yield Promise.delay(5000);
        }
    }
});

const createContentByFilenames = Promise.coroutine(function* (files) {
    var allContents = [];
    for (var file of files) {
        var contents = yield readFile(file, 'utf8');
        allContents.push([formatFilename(file), { format: 'jpad', payload: contents }]);
    }
    return allContents;
});

const formatFilename = file => file.substr(rulesHome.length).replace(/\\/g, '/').replace('.jpad', '');

module.exports = {
    buildLocalCache,
    getLatestRules: () => rulesCache.ruleset,
    getLatestRulesVersion: () => rulesCache.sha
};

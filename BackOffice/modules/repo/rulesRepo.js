import Git from 'nodegit';
import rimraf from 'rimraf';
import glob from 'glob';
const fs = require('promisify-node')('fs');

const promisify = (fn, context) => (...args) => new Promise((resolve, reject) =>
fn.call(context, ...args.concat([(err, res) => !!(err) ? reject(err) : resolve(res)])));

const rimrafAsync = promisify(rimraf);
const globAsync = promisify(glob);
const repoPath = 'rulesRepo';
const rulesDir = `${process.cwd()}/${repoPath}/rules`;

async function clone({ url, username, password }) {
  console.log("start cloning")
  await rimrafAsync(`./${repoPath}`);
  const repo = await Git.Clone(url, `./${repoPath}`, {
    fetchOpts: {
      callbacks: {
        credentials: () => Git.Cred.userpassPlaintextNew(username, password),
      },
    },
  });
  console.log('clone success');
  return repo;
}

function synchronized(fn) {
  let lock = Promise.resolve();
  return function () {
    const args = arguments;
    const context = this;
    return lock.then(() => {
      lock = fn.apply(context, args);
      return lock;
    }).catch(() => {
      lock = Promise.resolve();
    });
  };
}

async function isSynced(repo) {
  const remoteCommit = (await repo.getBranchCommit('remotes/origin/master'));
  const localCommit = (await repo.getBranchCommit('master'));
  return remoteCommit.id().equal(localCommit.id());
}

export function init(repoSettings = { url: 'http://tweek-gogs.07965c2a.svc.dockerapp.io/tweek/tweek-rules.git',
                                     username: 'tweek', password: '***REMOVED***' }) {
  const repoInit = clone(repoSettings);
  return {
    async getAllRules() {
      const rules = await globAsync('**/*.*', { cwd: rulesDir });
      return rules;
    },
    async getRule(path) {
      return (await fs.readFile(`${rulesDir}/${path}`)).toString();
    },
    updateRule: synchronized(async function(path, payload) {
      const { username, password } = repoSettings;
      const repo = await repoInit;
      console.log('start updating');
      await repo.fetchAll({
        callbacks: {
          credentials: () => Git.Cred.userpassPlaintextNew(username, password),
        } });
      await repo.mergeBranches('master', 'origin/master');
      if (!(await isSynced(repo))) {
        console.log('invalid repo state');
        throw new Error('invalid repo state');
      }
      try {
        await fs.writeFile(`${rulesDir}/${path}`, payload);
        const committer = Git.Signature.now('tweek-backoffice', 'tweek-backoffice@tweek');
        const author = Git.Signature.now('myuser', 'myuser@soluto.com');
        await repo.createCommitOnHead(
            [`rules/${path}`],
            author,
            committer,
            `update rule:${path}`
          );

        const remote = await repo.getRemote('origin');
        const code = await remote.push(['refs/heads/master:refs/heads/master'],
          {
            callbacks: {
              credentials: () => Git.Cred.userpassPlaintextNew(username, password),
            },
          });

        if (!(await isSynced(repo))) {
          console.log('push failed, attempting to reset');
          const remoteCommit = (await repo.getBranchCommit('remotes/origin/master'));
          await Git.Reset.reset(repo, remoteCommit, 3);
          console.log('reset worked');
          throw new Error('fail to push changes');
        }
        console.log(`push completed:${code}`);
      } catch (ex) {
        console.error(ex);
      }
    }),
  };
}

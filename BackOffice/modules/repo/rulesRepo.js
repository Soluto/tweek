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

function sync(fn) {
  let lock = Promise.resolve();
  return function () {
    const args = arguments;
    const context = this;
    return lock.then(() => {
      lock = fn.apply(context, args);
      return lock;
    });
  };
}

export function init(repoSettings = { url: 'http://tweek-gogs.07965c2a.svc.dockerapp.io/tweek/tweek-rules.git',
                                     username: 'tweek', password: '***REMOVED***' }) {
  const repoInit = clone(repoSettings);
  return {
    async getAllRules() {
      const rules = await globAsync('**/*.*', { cwd: rulesDir });
      return rules;
    },
    updateRule: sync(async function(path, payload) {
      console.log('start updating');
      const repo = await repoInit;
      await fs.writeFile(`${rulesDir}/${path}`, payload);
      const committer = Git.Signature.now('tweek-backoffice', 'tweek-backoffice@tweek');
      const author = Git.Signature.now('myuser', 'myuser@soluto.com');
      await repo.createCommitOnHead(
          [`rules/${path}`],
          author,
          committer,
          `update rule:${path}`
        );
      const { username, password } = repoSettings;
      try {
        const remote = await repo.getRemote('origin');
        const code = await remote.push(['refs/heads/master:refs/heads/master'],
          {
            callbacks: {
              credentials: () => Git.Cred.userpassPlaintextNew(username, password),
            },
          });

        const remoteCommit = (await repo.getBranchCommit('remotes/origin/master'));
        const localCommit = (await repo.getBranchCommit('master'));
        if (remoteCommit.id()[0] !== localCommit.id()[0]) {
          console.log('push failed, attempting to reset');
          await Git.Reset.reset(repo, remoteCommit, 1);
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

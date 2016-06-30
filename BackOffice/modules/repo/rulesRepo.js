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

function sync(fn){
   var lock = Promise.resolve();
   return function(){
     var args = arguments;
     var context = this;
     return lock.then(()=> {
       lock = fn.apply(context, args)
       return lock;
     });
   }
}

export function init(repoSettings = { url: 'http://tweek-gogs.07965c2a.svc.dockerapp.io/tweek/tweek-rules.git',
                                     username: 'tweek', password: 'po09!@QW' }) {
  const repoInit = clone(repoSettings);
  return {
    async getAllRules() {
      const rules = await globAsync('**/*.*', { cwd: rulesDir });
      return rules;
    },
    updateRule: sync(async function(path, payload) {
      const repo = await repoInit;
      console.log('writing file');
      await fs.writeFile(`${rulesDir}/${path}`, payload);
      console.log('finish writing file');
      const committer = Git.Signature.now('tweek-backoffice', 'tweek-backoffice@tweek');
      const author = Git.Signature.now('myuser', 'myuser@soluto.com');
      await repo.createCommitOnHead(
          [`rules/${path}`],
          author,
          committer,
          `update rule:${path}`
        );
      console.log('created commit');
      const { username, password } = repoSettings;
      // const remote = await Git.Remote.create(repo, 'origin', url);
      try {
        const remote = await repo.getRemote('origin');
        await remote.push(['refs/heads/master:refs/heads/master'],
          {
            callbacks: {
              credentials: () => Git.Cred.userpassPlaintextNew(username, password),
            },
          });
        console.log('push completed');
      } catch (ex) {
        console.error(ex);
      }
    }),
  };
}

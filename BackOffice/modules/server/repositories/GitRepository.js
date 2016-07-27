import Git from 'nodegit';
import rimraf from 'rimraf';
import glob from 'glob';
import synchronized from '../../utils/synchronizedFunction';
const fs = require('promisify-node')('fs');

const promisify = (fn, context) => (...args) => new Promise((resolve, reject) =>
  fn.call(context, ...args.concat([(err, res) => !!(err) ? reject(err) : resolve(res)])));

const rimrafAsync = promisify(rimraf);
const globAsync = promisify(glob);

class GitRepository {
  constructor(settings) {
    this._username = settings.username;
    this._password = settings.password;
    this._url = settings.url;
    this._localPath = settings.localPath;

    this.TWEEK_BACKOFFICE_USER = 'tweek-backoffice';
    this.TWEEK_BACKOFFICR_MAIL = 'tweek-backoffice@tweek';

    this._tweekCommiterSignature = Git.Signature.now(this.TWEEK_BACKOFFICE_USER, this.TWEEK_BACKOFFICR_MAIL);
  }

  static init(settings) {
    const gitRepo = new GitRepository(settings);
    gitRepo.init();
    return gitRepo;
  }

  init() {
    this._repoPromise = this._cloneAsync();
  }

  async getFileNames(folderName = '') {
    await this._repoPromise;

    return await globAsync('**/*.*', {
      cwd: `${this._localPath}/${folderName}`,
    });
  }

  async readFile(fileName) {
    await this._repoPromise;

    return (await fs.readFile(`${this._localPath}/${fileName}`)).toString();
  }

  updateFile = synchronized(async function (fileName, payload, { name = 'unknown', email = 'unknown@soluto.com' }) {
    const repo = await this._repoPromise;
    console.log('start updating');

    await repo.fetchAll(this._defaultGitOperationSettings);

    await repo.mergeBranches('master', 'origin/master');

    if (!(await this._isSynced())) {
      console.log('invalid repo state');
      throw new Error('invalid repo state');
    }

    try {
      await fs.writeFile(`${this._localPath}/${fileName}`, payload);

      const author = Git.Signature.now(name, email);

      await repo.createCommitOnHead(
        [fileName],
        author,
        this._tweekCommiterSignature,
        `update file:${fileName}`
      );

      const remote = await repo.getRemote('origin');
      const code = await remote.push(['refs/heads/master:refs/heads/master'],
        this._defaultGitOperationSettings);

      if (!(await this._isSynced())) {
        console.log('push failed, attempting to reset');
        const remoteCommit = (await repo.getBranchCommit('remotes/origin/master'));
        return await Git.Reset.reset(repo, remoteCommit, 3);

        console.log('reset worked');
        throw new Error('fail to push changes');
      }

      console.log(`push completed:${code}`);
    } catch (ex) {
      console.error(ex);
    }
  })

  get _defaultGitOperationSettings() {
    return {
      callbacks: {
        credentials: () =>
          Git.Cred.userpassPlaintextNew(this._username, this._password),
      },
    };
  }

  async _isSynced() {
    const repo = await this._repoPromise;

    const remoteCommit = (await repo.getBranchCommit('remotes/origin/master'));
    const localCommit = (await repo.getBranchCommit('master'));

    return remoteCommit.id().equal(localCommit.id());
  }

  async _cloneAsync() {
    console.log('start cloning', this._localPath);
    await rimrafAsync(this._localPath);

    const repo = await Git.Clone(this._url, this._localPath, {
      fetchOpts: this._defaultGitOperationSettings,
    });

    console.log('clone success');
    return repo;
  }
}

export default GitRepository;

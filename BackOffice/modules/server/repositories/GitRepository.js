import Git from 'nodegit';
import glob from 'glob';
import synchronized from '../../utils/synchronizedFunction';

const fs = require('promisify-node')('fs-extra');

const promisify = (fn, context) => (...args) => new Promise((resolve, reject) =>
  fn.call(context, ...args.concat([(err, res) => !!(err) ? reject(err) : resolve(res)])));

const globAsync = promisify(glob);

class GitRepository {

  static TWEEK_BACKOFFICE_USER = 'tweek-backoffice';
  static TWEEK_BACKOFFICE_MAIL = 'tweek-backoffice@tweek';
  static UNKNOWN_MODIFY_VALUE = 'uknown';

  constructor(settings) {
    this._username = settings.username;
    this._password = settings.password;
    this._url = settings.url;
    this._localPath = settings.localPath;

    this._tweekCommiterSignature =
      Git.Signature.now(GitRepository.TWEEK_BACKOFFICE_USER, GitRepository.TWEEK_BACKOFFICE_MAIL);
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
    console.log('git read', fileName);
    await this._repoPromise;
    const fileContent = (await fs.readFile(`${this._localPath}/${fileName}`)).toString();

    const { modifyDate, modifyUser, commitSha } = await this._getFileLastModifiedDate(fileName);

    const modifyCompareUrl = commitSha ?
      this._getRepositoryUrl(`commit/${commitSha}`) :
      this._getRepositoryUrl(`commits/master/${fileName}`);

    const fileModificationData = {
      modifyUser,
      modifyDate,
      modifyCompareUrl,
    };

    return {
      fileContent,
      fileModificationData,
    };
  }

  updateFile = synchronized(async function (fileName, payload, { name, email }) {
    const repo = await this._repoPromise;
    console.log('git update', fileName);

    await repo.fetchAll(this._defaultGitOperationSettings);

    await repo.mergeBranches('master', 'origin/master');

    if (!(await this._isSynced())) {
      console.log('invalid repo state');
      throw new Error('invalid repo state');
    }

    try {
      await fs.ensureFile(this._getFileLocalPath(fileName));
      await fs.writeFile(this._getFileLocalPath(fileName), payload);

      const author = Git.Signature.now(name, email);

      await repo.createCommitOnHead(
        [fileName],
        author,
        this._tweekCommiterSignature,
        `update file: ${fileName}`
      );

      await this._pushRepositoryChanges();
    } catch (ex) {
      console.error(ex);
    }
  })

  deleteFile = synchronized(async function (fileName, { name, email }) {
    const repo = await this._repoPromise;
    console.log('git remove', fileName);

    try {
      const author = Git.Signature.now(name, email);

      const repoIndex = await repo.refreshIndex();
      await repoIndex.removeByPath(fileName);
      await repoIndex.write();
      const oid = await repoIndex.writeTree();
      const parent = await repo.getHeadCommit();

      await repo.createCommit(
        'HEAD',
        author,
        this._tweekCommiterSignature,
        `delete file: ${fileName}`,
        oid,
        [parent]
      );

      await this._pushRepositoryChanges();

      await fs.remove(this._getFileLocalPath(fileName));
    } catch (ex) {
      console.error(ex);
    }
  });

  async _pushRepositoryChanges() {
    const repo = await this._repoPromise;
    try {
      console.log('pushing changes');

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
  }

  _getFileLocalPath(fileName) {
    return `${this._localPath}/${fileName}`;
  }

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
    await fs.remove(this._localPath);

    console.log('cloning rules repository');
    const repo = await Git.Clone(this._url, this._localPath, {
      fetchOpts: this._defaultGitOperationSettings,
    });

    console.log('clone success');
    return repo;
  }

  async _getFileLastModifiedDate(fileName) {
    const repo = await this._repoPromise;

    let modifyDate = GitRepository.UNKNOWN_MODIFY_VALUE;
    let modifyUser = GitRepository.UNKNOWN_MODIFY_VALUE;
    let commitSha = null;

    try {
      const firstCommitOnMaster = await repo.getMasterCommit();
      const walker = repo.createRevWalk();
      walker.push(firstCommitOnMaster.sha());

      const lastCommits = await walker.fileHistoryWalk(fileName, 100);
      const lastCommit = lastCommits[0].commit;

      modifyDate = lastCommit.date();
      modifyUser = lastCommit.author().name();
      commitSha = lastCommit.sha();
    }
    catch (exp) {
      console.log('failed read modification data', exp);
    }

    return {
      modifyDate,
      modifyUser,
      commitSha,
    };
  }

  _getRepositoryUrl(suffix) {
    return `${this._url}/${suffix}`;
  }
}

export default GitRepository;

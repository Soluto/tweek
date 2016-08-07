import Git from 'nodegit';
import glob from 'glob';
import synchronized from '../../utils/synchronizedFunction';
import moment from 'moment';

const fs = require('promisify-node')('fs-extra');

const promisify = (fn, context) => (...args) => new Promise((resolve, reject) =>
  fn.call(context, ...args.concat([(err, res) => !!(err) ? reject(err) : resolve(res)])));

const globAsync = promisify(glob);

class GitRepository {

  static TWEEK_BACKOFFICE_USER = 'tweek-backoffice';
  static TWEEK_BACKOFFICE_MAIL = 'tweek-backoffice@tweek';
  static UNKNOWN_MODIFY_VALUE = 'uknown';
  static MODIFY_DATE_FORMAT = 'DD/MM/YYYY HH:mm';

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
    await this._repoPromise;
    const fileContent = (await fs.readFile(`${this._localPath}/${fileName}`)).toString();

    const modificationData = await this._getFileLastModifiedDate(fileName);

    const lastModifyCompareUrl = modificationData.commitSha ?
      this._getRepositoryUrl(`commit/${modificationData.commitSha}`) :
      this._getRepositoryUrl(`commits/master/search?q=${fileName}`);

    return {
      fileContent,
      lastModifyDate: modificationData.lastModifyDate,
      modifierUser: modificationData.modifierUser,
      lastModifyCompareUrl,
    };
  }

  updateFile = synchronized(async function (fileName, payload, { name, email }) {
    const repo = await this._repoPromise;
    console.log('start updating');

    await repo.fetchAll(this._defaultGitOperationSettings);

    await repo.mergeBranches('master', 'origin/master');

    if (!(await this._isSynced())) {
      console.log('invalid repo state');
      throw new Error('invalid repo state');
    }

    try {
      await fs.ensureFile(`${this._localPath}/${fileName}`);
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
    await fs.remove(this._localPath);

    const repo = await Git.Clone(this._url, this._localPath, {
      fetchOpts: this._defaultGitOperationSettings,
    });

    console.log('clone success');
    return repo;
  }

  async _getFileLastModifiedDate(fileName) {
    const repo = await this._repoPromise;

    let lastModifyDate = GitRepository.UNKNOWN_MODIFY_VALUE;
    let modifierUser = GitRepository.UNKNOWN_MODIFY_VALUE;
    let commitSha = '';

    try {
      const firstCommitOnMaster = await repo.getMasterCommit();
      const walker = repo.createRevWalk();
      walker.push(firstCommitOnMaster.sha());

      const lastCommits = await walker.fileHistoryWalk(fileName, 100);
      const lastCommit = lastCommits[0].commit;
      const parsedDate = moment(lastCommit.date());

      lastModifyDate = parsedDate.format(GitRepository.MODIFY_DATE_FORMAT);
      modifierUser = lastCommit.author().name();
      commitSha = lastCommit.sha();
    }
    catch (exp) {
      console.log('failed read modification data', exp);
    } finally {
      return {
        lastModifyDate,
        modifierUser,
        commitSha,
      };
    }
  }

  _getRepositoryUrl(suffix) {
    return `${this._url}/${suffix}`;
  }
}

export default GitRepository;

import Git from 'nodegit';
import glob from 'glob-promise';
import path from 'path';
const fs = require('promisify-node')('fs-extra');

export default class GitRepository {

  constructor(repo, operationSettings) {
    this._repo = repo;
    this._modifiedFiles = [];
    this._operationSettings = operationSettings;
  }

  static async create(settings) {
    console.log('cleaning up current working folder');
    await fs.remove(settings.localPath);

    const operationSettings = {
      callbacks: {
        credentials: () =>
          Git.Cred.userpassPlaintextNew(settings.username, settings.password),
      },
    };

    console.log('cloning rules repository');
    const repo = await Git.Clone(settings.url, settings.localPath, {
      fetchOpts: operationSettings,
    });

    console.log('clone success');
    return new GitRepository(repo, operationSettings);
  }

  listFiles(directoryPath) {
    return glob('**/*.*', { cwd: path.join(this._repo.workdir(), directoryPath) });
  }

  async readFile(fileName) {
    return (await fs.readFile(path.join(this._repo.workdir(), fileName))).toString();
  }

  async getFileDetails(fileName) {
    let modifyDate = "unknown";
    let modifyUser = "unknown";
    let commitSha = null;

    let remote = await this._repo.getRemote('origin');
    let remoteUrl = remote.url();

    try {
      const firstCommitOnMaster = await this._repo.getMasterCommit();
      const walker = this._repo.createRevWalk();
      walker.push(firstCommitOnMaster.sha());
      walker.sorting(Git.Revwalk.SORT.Time);

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
      modifyCompareUrl: commitSha ? path.join(remoteUrl, "commit", commitSha) : path.join(remoteUrl, "commits/master/", fileName)
    };
  }

  async updateFile(fileName, content) {
    let filePath = path.join(this._repo.workdir(), fileName);
    await fs.ensureFile(filePath);
    await fs.writeFile(filePath, content);

    if (!this._modifiedFiles.contains(fileName))
    {
      this._modifiedFiles.push(fileName);
    }
  }

  async deleteFile(fileName) {
    let filePath = path.join(this._repo.workdir(), fileName);

    await fs.remove(filePath);

    const repoIndex = await this._repo.refreshIndex();
    await repoIndex.removeByPath(fileName);
    await repoIndex.write();
    await repoIndex.writeTree();
  }

  async commitAndPush(message, { name, email }){
    const author = Git.Signature.now(name, email);
    const pusher = Git.Signature.now('tweek-backoffice', 'tweek-backoffice@tweek');
    await this._repo.createCommitOnHead(
      this._modifiedFiles,
      author,
      pusher,
      message
    );

    await this._pushRepositoryChanges(message);
  }

  async pull() {
    await this._repo.fetchAll(this._operationSettings);
    await this._repo.mergeBranches('master', 'origin/master');

    const isSynced = await this.isSynced();
    if (!isSynced) {
      throw new Error('invalid repo state');
    }
  }

  async isSynced() {

    const remoteCommit = (await this._repo.getBranchCommit('remotes/origin/master'));
    const localCommit = (await this._repo.getBranchCommit('master'));

    return remoteCommit.id().equal(localCommit.id()) === 1;
  }

  async _pushRepositoryChanges(actionName) {
    try {
      console.log('pushing changes:', actionName);

      const remote = await this._repo.getRemote('origin');
      await remote.push(['refs/heads/master:refs/heads/master'], this._operationSettings);

      if (!(await this.isSynced())) {
        console.log('push failed, attempting to reset');
        const remoteCommit = (await repo.getBranchCommit('remotes/origin/master'));
        await Git.Reset.reset(this._repo, remoteCommit, 3);

        console.error('fail to push changes - reset changes');
      }
      else{
        console.log('push completed');
      }

    } catch (ex) {
      console.error(ex);
    }
  }
}


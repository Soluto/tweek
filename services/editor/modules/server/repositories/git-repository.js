import Git from 'nodegit';
import glob from 'glob-promise';
import path from 'path';
const fs = require('promisify-node')('fs-extra');

export default class GitRepository {

  constructor(repo, operationSettings) {
    this._repo = repo;
    this._operationSettings = operationSettings;
  }

  static async create(settings) {
    console.log('cleaning up current working folder');
    await fs.remove(settings.localPath);

    const operationSettings = {
      callbacks: {
        credentials: () => settings.url.startsWith('ssh://') ? Git.Cred.sshKeyNew(settings.username, settings.publicKey, settings.privateKey, '')
          : Git.Cred.userpassPlaintextNew(settings.username, settings.password),
      },
    };

    console.log('clonning rules repository');
    const clonningOp = 'clonning end in';
    console.time(clonningOp);

    const repo = await Git.Clone(settings.url, settings.localPath, {
      fetchOpts: operationSettings,
    });

    console.timeEnd(clonningOp);
    return new GitRepository(repo, operationSettings);
  }

  async listFiles(directoryPath) {
    return await glob('**/*.*', { cwd: path.join(this._repo.workdir(), directoryPath) });
  }

  async readFile(fileName, { revision } = {}) {

    if (!revision) return (await fs.readFile(path.join(this._repo.workdir(), fileName))).toString();
    const sha = revision ? revision : (await this._repo.getMasterCommit()).sha();
    const commit = await this._repo.getCommit(sha)
    const entry = await commit.getEntry(fileName);
    return entry.isBlob() ? (await entry.getBlob()).toString() : undefined;
  }

  async getFileDetails(fileName, { revision } = {}) {
    let modifyDate = 'unknown';
    let modifyUser = 'unknown';
    let commitSha = null;

    let remote = await this._repo.getRemote('origin');
    let remoteUrl = remote.url();

    const sha = revision ? revision : (await this._repo.getMasterCommit()).sha();

    const walker = this._repo.createRevWalk();
    walker.push(sha);
    walker.sorting(Git.Revwalk.SORT.TIME);

    const historyEntries = await walker.fileHistoryWalk(fileName, 100);
    if (historyEntries.length == 0) {
      console.info('No recent history found for key');
    }
    return historyEntries.map(({ commit }) => ({
      sha: commit.sha(),
      author: `${commit.author().name()}`,
      date: commit.date(),
      message: commit.message()
    }))
  }

  async updateFile(fileName, content) {
    let filePath = path.join(this._repo.workdir(), fileName);
    await fs.ensureFile(filePath);
    await fs.writeFile(filePath, content);

    const repoIndex = await this._repo.index();
    await repoIndex.addByPath(fileName);
    await repoIndex.write();
    await repoIndex.writeTree();
  }

  async deleteFile(fileName) {
    let filePath = path.join(this._repo.workdir(), fileName);

    await fs.remove(filePath);

    const repoIndex = await this._repo.index();
    await repoIndex.removeByPath(fileName);
    await repoIndex.write();
    await repoIndex.writeTree();
  }

  async commitAndPush(message, { name, email }) {
    const author = Git.Signature.now(name, email);
    const pusher = Git.Signature.now('tweek-backoffice', 'tweek-backoffice@tweek');
    await this._repo.createCommitOnHead(
      [],
      author,
      pusher,
      message
    );

    await this._pushRepositoryChanges(message);
  }

  async fetch() {
    await this._repo.fetchAll(this._operationSettings);
  }

  async mergeMaster() {
    await this._repo.mergeBranches('master', 'origin/master');

    const isSynced = await this.isSynced();
    if (!isSynced) {
      console.warn('Repo is not synced after pull');
      await this.reset();
    }
  }

  async reset() {
    const remoteCommit = (await this._repo.getBranchCommit('remotes/origin/master'));
    await Git.Reset.reset(this._repo, remoteCommit, 3);
  }

  async isSynced() {
    const remoteCommit = (await this._repo.getBranchCommit('remotes/origin/master'));
    const localCommit = (await this._repo.getBranchCommit('master'));

    return remoteCommit.id().equal(localCommit.id()) === 1;
  }

  async _pushRepositoryChanges(actionName) {
    console.log('pushing changes:', actionName);

    const remote = await this._repo.getRemote('origin');
    await remote.push(['refs/heads/master:refs/heads/master'], this._operationSettings);

    const isSynced = await this.isSynced();

    if (!isSynced) {
      console.warn('Not synced after Push, attempting to reset');
      await this.reset();

      throw new Error('Repo was not in sync after push');
    }
  }
}

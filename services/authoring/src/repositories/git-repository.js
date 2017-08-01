const path = require('path');
const git = require('nodegit');
const simpleGit = require('simple-git');
const fs = require('fs-extra');
const R = require('ramda');
const { mapSeries, reduce } = require('bluebird');

async function listFiles(repo, filter = () => true) {
  let commit = await repo.getMasterCommit();
  let tree = await commit.getTree();
  let walker = tree.walk(true);
  return await new Promise((resolve, reject) => {
    let entries = [];
    walker.on('entry', (entry) => {
      const path = entry.path().replace(/\\/g, '/');
      if (filter(path)) return entries.push(path);
    });
    walker.on('end', () => resolve(entries));
    walker.on('error', ex => reject(ex));
    walker.start();
  });
}

class GitRepository {
  constructor(repo, operationSettings) {
    this._repo = repo;
    this._operationSettings = operationSettings;
    this._simpleRepo = simpleGit(repo.workdir());
  }

  static async create(settings) {
    console.log('cleaning up current working folder');
    await fs.remove(settings.localPath);

    const operationSettings = {
      callbacks: {
        credentials: () =>
          settings.url.startsWith('ssh://')
            ? git.Cred.sshKeyNew(settings.username, settings.publicKey, settings.privateKey, '')
            : git.Cred.userpassPlaintextNew(settings.username, settings.password),
      },
    };

    console.log('clonning rules repository');
    const clonningOp = 'clonning end in';
    console.time(clonningOp);

    const repo = await git.Clone(settings.url, settings.localPath, {
      fetchOpts: operationSettings,
    });

    console.timeEnd(clonningOp);
    return new GitRepository(repo, operationSettings);
  }

  async listFiles(directoryPath = '') {
    const normalizedDirPath = `${path.normalize(`${directoryPath}/.`)}/`.replace(/\\/g, '/');
    return (await listFiles(this._repo, path => path.startsWith(normalizedDirPath))).map(x =>
      x.substring(normalizedDirPath.length),
    );
  }

  async readFile(fileName, { revision } = {}) {
    const commit = await (revision ? this._repo.getCommit(revision) : this._repo.getMasterCommit());
    const entry = await commit.getEntry(fileName);
    return entry.isBlob() ? (await entry.getBlob()).toString() : undefined;
  }

  async getHistory(fileNames, { revision, since } = {}) {
    fileNames = Array.isArray(fileNames) ? fileNames : [fileNames];

    const historyEntries = await Promise.all(
      fileNames.map(async (file) => {
        const options = [`--follow`, file];
        if (since) options.unshift(`--since="${since}"`);

        const history = await new Promise((resolve, reject) => {
          this._simpleRepo.log(options, (err, log) => {
            if (err) reject(err);
            else resolve(log);
          });
        });
        return history.all;
      }),
    );

    const mapEntry = ({ hash, date, message, author_name }) => ({
      sha: hash,
      author: author_name,
      date,
      message,
    });

    const uniqSort = R.pipe(
      R.flatten,
      R.map(mapEntry),
      R.uniqBy(R.prop('sha')),
      R.sort(R.descend(R.prop('date'))),
    );

    return uniqSort(historyEntries);
  }

  async updateFiles(files) {
    for (let file of files) {
      const content = await file.read();
      await this.updateFile(file.name, content);
    }
  }

  async updateFile(fileName, content) {
    const workdir = this._repo.workdir();
    const filePath = path.join(workdir, fileName);
    await fs.ensureFile(filePath);
    await fs.writeFile(filePath, content);

    const realPath = await fs.realpath(filePath);
    fileName = path.relative(workdir, realPath).replace(/\\/g, '/');

    const repoIndex = await this._repo.index();
    await repoIndex.addByPath(fileName);
    await repoIndex.write();
    await repoIndex.writeTree();
  }

  async deleteFile(fileName) {
    const workdir = this._repo.workdir();
    const filePath = path.join(workdir, fileName);

    const realPath = await fs.realpath(filePath);
    fileName = path.relative(workdir, realPath).replace(/\\/g, '/');

    await fs.remove(filePath);

    const repoIndex = await this._repo.index();
    await repoIndex.removeByPath(fileName);
    await repoIndex.write();
    await repoIndex.writeTree();
  }

  async commitAndPush(message, { name, email }) {
    const author = git.Signature.now(name, email);
    const pusher = git.Signature.now('tweek-editor', 'tweek-editor@tweek');
    await this._repo.createCommitOnHead([], author, pusher, message);

    await this._pushRepositoryChanges(message);
  }

  async fetch() {
    await this._repo.fetchAll(this._operationSettings);
  }

  async mergeMaster() {
    let commitId = await this._repo.mergeBranches('master', 'origin/master');

    const isSynced = await this.isSynced();
    if (!isSynced) {
      console.warn('Repo is not synced after pull');
      commitId = await this.reset();
    }

    return commitId;
  }

  async reset() {
    const remoteCommit = await this._repo.getBranchCommit('remotes/origin/master');
    await git.Reset.reset(this._repo, remoteCommit, 3);
    return remoteCommit.id();
  }

  async isSynced() {
    const remoteCommit = await this.getLastCommit('remotes/origin/master');
    const localCommit = await this.getLastCommit('master');

    return remoteCommit.id().equal(localCommit.id()) === 1;
  }

  getLastCommit(branch = 'master') {
    return this._repo.getBranchCommit(branch);
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

module.exports = GitRepository;

import path = require('path');
import git = require('nodegit');
import simpleGit = require('simple-git');
import fs = require('fs-extra');
import R = require('ramda');

async function listFiles(repo: git.Repository, filter: (path: string) => boolean = () => true) {
  let commit = await repo.getMasterCommit();
  let tree = await commit.getTree();
  let walker = tree.walk(true);
  return await new Promise<any>((resolve, reject) => {
    let entries: string[] = [];
    walker.on('entry', (entry: any) => {
      const path = entry.path().replace(/\\/g, '/');
      if (filter(path)) return entries.push(path);
      return null;
    });
    walker.on('end', () => resolve(entries));
    walker.on('error', ex => reject(ex));
    (<any>walker).start();
  });
}

export type OperationSettings = {
  callbacks: {
    credentials: () => git.Cred
  }
};

export default class GitRepository {
  _simpleRepo: any;

  constructor(private _repo: git.Repository, private _operationSettings: OperationSettings) {
    this._simpleRepo = simpleGit(_repo.workdir());
  }

  static async create(settings: { url: string, localPath: string, username: string, publicKey: string, privateKey: string, password: string }) {
    console.log('cleaning up current working folder');
    await fs.remove(settings.localPath);

    const operationSettings: OperationSettings = {
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

    const repo = await git.Clone.clone(settings.url, settings.localPath, {
      fetchOpts: operationSettings,
    });

    console.timeEnd(clonningOp);
    return new GitRepository(repo, operationSettings);
  }

  async listFiles(directoryPath = '') {
    const normalizedDirPath = `${path.normalize(`${directoryPath}/.`)}/`.replace(/\\/g, '/');
    return (await listFiles(this._repo, filePath => filePath.startsWith(normalizedDirPath))).map(x =>
      x.substring(normalizedDirPath.length),
    );
  }

  async readFile(fileName: string, { revision }: any = {}) {
    const commit = await (revision ? this._repo.getCommit(revision) : this._repo.getMasterCommit());
    const entry = await commit.getEntry(fileName);
    return entry.isBlob() ? (await entry.getBlob()).toString() : undefined;
  }

  async getHistory(fileNames: string | string[], { revision, since }) {
    fileNames = Array.isArray(fileNames) ? fileNames : [fileNames];

    const historyEntries = await Promise.all(
      fileNames.map(async (file) => {
        const options = [`--follow`, file];
        if (since) options.unshift(`--since="${since}"`);

        const history = await new Promise<any>((resolve, reject) => {
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
    await this._repo.fetchAll(this._operationSettings, undefined);
  }

  async mergeMaster(): Promise<any> {
    let commitId = await this._repo.mergeBranches('master', 'origin/master', undefined, undefined, undefined);

    const isSynced = await this.isSynced();
    if (!isSynced) {
      console.warn('Repo is not synced after pull');
      commitId = await this.reset();
    }

    return commitId;
  }

  async reset(): Promise<any> {
    const remoteCommit = await this._repo.getBranchCommit('remotes/origin/master');
    await git.Reset.reset(this._repo, <any>remoteCommit, 3, undefined);
    return remoteCommit.id();
  }

  async isSynced() {
    const remoteCommit = await this.getLastCommit('remotes/origin/master');
    const localCommit = await this.getLastCommit('master');

    return remoteCommit.id().equal(localCommit.id()) === 1;
  }

  getLastCommit(branch = 'master'): Promise<any> {
    return this._repo.getBranchCommit(branch);
  }

  async _pushRepositoryChanges(actionName) {
    console.log('pushing changes:', actionName);

    const remote = await this._repo.getRemote('origin', undefined);
    await remote.push(['refs/heads/master:refs/heads/master'], <any>this._operationSettings, undefined);

    const isSynced = await this.isSynced();

    if (!isSynced) {
      console.warn('Not synced after Push, attempting to reset');
      await this.reset();

      throw new Error('Repo was not in sync after push');
    }
  }
}

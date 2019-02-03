import path = require('path');
import git = require('nodegit');
import simpleGit = require('simple-git');
import fs = require('fs-extra');
import R = require('ramda');
import { Commit } from 'nodegit/commit';
import { Oid } from 'nodegit';
import { logger } from '../utils/jsonLogger';

export class ValidationError {
  constructor(public message) { }
}

export class RepoOutOfDateError {
  constructor(public message) { }
}

async function listFiles(repo: git.Repository, filter: (path: string) => boolean = () => true) {
  const commit = await repo.getMasterCommit();
  const tree = await commit.getTree();
  const walker = tree.walk(true);
  return await new Promise<any>((resolve, reject) => {
    const entries: string[] = [];
    walker.on('entry', (entry: any) => {
      const entryPath = entry.path().replace(/\\/g, '/');
      if (filter(entryPath)) { return entries.push(entryPath); }
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
    logger.log('cleaning up current working folder');
    await fs.remove(settings.localPath);

    const operationSettings: OperationSettings = {
      callbacks: {
        credentials: () =>
          settings.url.startsWith('ssh://')
            ? git.Cred.sshKeyNew(settings.username, settings.publicKey, settings.privateKey, '')
            : git.Cred.userpassPlaintextNew(settings.username, settings.password),
      },
    };

    logger.log('clonning rules repository');
    const clonningOp = 'clonning end in';
    // FIXME: needs json logging
    console.time(clonningOp);
    const repo = await git.Clone.clone(settings.url, settings.localPath, {
      fetchOpts: operationSettings,
    });
    // FIXME: needs json logging
    console.timeEnd(clonningOp);
    return new GitRepository(repo, operationSettings);
  }

  async listFiles(directoryPath = '') {
    const normalizedDirPath = `${path.normalize(`${directoryPath}/.`)}/`.replace(/\\/g, '/');
    return (await listFiles(this._repo, filePath => filePath.startsWith(normalizedDirPath))).map(x =>
      x.substring(normalizedDirPath.length),
    );
  }

  async readFile(fileName: string, { revision }: any = {}) : Promise<string | undefined> {
    const commit = await (revision ? this._repo.getCommit(revision) : this._repo.getMasterCommit());
    const entry = await commit.getEntry(fileName);
    return entry.isBlob() ? (await entry.getBlob()).toString() : undefined;
  }

  async getHistory(fileNames: string | string[], { revision, since }) {
    fileNames = Array.isArray(fileNames) ? fileNames : [fileNames];

    const historyEntries = await Promise.all(
      fileNames.map(async (file) => {
        const options = [file];
        if (since) { options.unshift(`--since="${since}"`); }

        const history = await new Promise<any>((resolve, reject) => {
          this._simpleRepo.log(options, (err, log) => {
            if (err) { reject(err); } else { resolve(log); }
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

    const exists = await fs.existsSync(filePath);
    if (!exists) {
      return;
    }
    const realPath = await fs.realpath(filePath);
    fileName = path.relative(workdir, realPath).replace(/\\/g, '/');

    await fs.remove(filePath);

    const repoIndex = await this._repo.index();
    await repoIndex.removeByPath(fileName);
    await repoIndex.write();
    await repoIndex.writeTree();
  }

  async commitAndPush(message, { name, email }): Promise<Oid | null> {
    const head = await this.getLastCommit();
    const diff = await git.Diff.treeToIndex(this._repo, await head.getTree(), null, null);
    const patches = await diff.patches();
    if (patches.length === 0) { return null; }

    const author = git.Signature.now(name, email);
    const pusher = git.Signature.now('tweek-editor', 'tweek-editor@tweek');
    const commitId = await this._repo.createCommitOnHead([], author, pusher, message);

    await this._pushRepositoryChanges(message);
    return commitId;
  }

  async fetch() {
    await this._repo.fetchAll(this._operationSettings, undefined);
  }

  async mergeMaster(): Promise<any> {
    let commitId = await this._repo.mergeBranches('master', 'origin/master', undefined, undefined, undefined);

    const isSynced = await this.isSynced();
    if (!isSynced) {
      logger.warn('Repo is not synced after pull');
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

  getLastCommit(branch = 'master'): Promise<Commit> {
    return this._repo.getBranchCommit(branch);
  }

  async _pushRepositoryChanges(actionName) {
    try {
      await new Promise((resolve, reject) => this._simpleRepo.push('origin', 'master', (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      }));
    } catch (ex) {
      if (ex.includes('400 Bad Request')) {
        throw new ValidationError('failed validation:' + ex);
      }
      if (ex.includes('Updates were rejected because the tip of your current branch is behind') || ex.includes('(e.g., \'git pull ...\') before pushing again.')) {
        throw new RepoOutOfDateError(ex);
      }
      throw new Error('unknown error');
    }

    const isSynced = await this.isSynced();
    if (!isSynced) {
      logger.warn('Not synced after Push, attempting to reset');
      throw new Error('Repo was not in sync after push');
    }
  }
}

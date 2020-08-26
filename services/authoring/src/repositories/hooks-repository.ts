import Transactor from '../utils/transactor';
import GitRepository from './git-repository';
import { Oid } from 'nodegit';
import Author from '../utils/author';
import Hook from '../utils/hook';
import hash from 'object-hash';
import shortid from 'shortid';

const hooksFilePath = 'hooks.json';
const missingHooksFileMessage = `the path '${hooksFilePath}' does not exist in the given tree`;

export class HooksRepository {
  _allHooks: Hook[];

  constructor(private _gitTransactionManager: Transactor<GitRepository>) {}

  async getHooks(forceRead = false): Promise<Hook[]> {
    let hooksJson;
    if (this._allHooks && !forceRead) return this._allHooks;

    try {
      hooksJson = await this._gitTransactionManager.read(gitRepo => gitRepo.readFile(hooksFilePath));
    } catch (err) {
      if (err.message !== missingHooksFileMessage) throw err;

      hooksJson = '[]';
    }

    this._allHooks = JSON.parse(hooksJson);
    return this._allHooks;
  }

  async createHook(hook: Hook, author: Author): Promise<Oid> {
    hook.id = shortid.generate();

    const allHooks = await this.getHooks();
    allHooks.push(hook);

    return this._updateHooksFile(allHooks, author);
  }

  async updateHook(hook: Hook, author: Author): Promise<Oid> {
    const allHooks = await this.getHooks();
    const hookIndex = allHooks.findIndex(({ id }) => hook.id === id);

    if (hookIndex === -1) throw new Error('updateHook - The hook to update does not exist');

    allHooks[hookIndex] = hook;
    return this._updateHooksFile(allHooks, author);
  }

  async deleteHook(id: string, author: Author): Promise<Oid> {
    const allHooks = await this.getHooks();
    const hookIndex = allHooks.findIndex(({ id: hookId }) => hookId === id);

    if (hookIndex === -1) throw new Error('deleteHook - The hook to delete does not exist');

    allHooks.splice(hookIndex, 1);
    return this._updateHooksFile(allHooks, author);
  }

  async getETag(): Promise<string> {
    const allHooks = await this.getHooks();
    return hash(allHooks);
  }

  async validateETag(etag: string): Promise<boolean> {
    const currentETag = await this.getETag();
    return etag === currentETag;
  }

  private async _updateHooksFile(hooks: Hook[], author: Author): Promise<Oid> {
    const hooksJson = JSON.stringify(hooks);

    return this._gitTransactionManager.write(async gitRepo => {
      await gitRepo.updateFile(hooksFilePath, hooksJson);
      const oid = await gitRepo.commitAndPush('Updating hooks', author);

      this._allHooks = null;
      return oid;
    });
  }
}

export class HooksRepositoryFactory {
  constructor(private _gitTransactionManager: Transactor<GitRepository>) {}

  createRepository(): HooksRepository {
    return new HooksRepository(this._gitTransactionManager);
  }
}

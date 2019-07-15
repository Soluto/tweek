import Transactor from '../utils/transactor';
import GitRepository from './git-repository';
import { Oid } from 'nodegit';
import Author from '../utils/author';
import { Hook, KeyHooks } from '../utils/hooks';
import hash from 'object-hash';

const hooksFilePath = 'hooks.json';

export class HooksRepository {
  _allHooks: KeyHooks[];

  constructor(private _gitTransactionManager: Transactor<GitRepository>) {}

  async getHooks(forceRead = false): Promise<KeyHooks[]> {
    if (this._allHooks && !forceRead) return this._allHooks;

    return this._gitTransactionManager.read(async (gitRepo) => {
      const hooksJson = await gitRepo.readFile(hooksFilePath);
      this._allHooks = JSON.parse(hooksJson);
      return this._allHooks;
    });
  }

  async getHooksForKeyPath(keyPath: string): Promise<KeyHooks> {
    const allHooks = await this.getHooks();
    return this._getKeyHooks(allHooks, keyPath);
  }

  async createHook(keyPath: string, hook: Hook, author: Author): Promise<Oid> {
    const allHooks = await this.getHooks();
    let keyHooks = this._getKeyHooks(allHooks, keyPath);

    if (!keyHooks) {
      keyHooks = { keyPath, hooks: [] };
      allHooks.push(keyHooks);
    }

    keyHooks.hooks.push(hook);
    return this._updateHooksFile(allHooks, author);
  }

  async updateHook(keyPath: string, index: number, hook: Hook, author: Author): Promise<Oid> {
    const allHooks = await this.getHooks();
    const keyHooks = this._getKeyHooks(allHooks, keyPath);

    if (!keyHooks || !keyHooks.hooks[index])
      throw new Error('updateHook - The hook to update does not exist');

    keyHooks.hooks[index] = hook;
    return this._updateHooksFile(allHooks, author);
  }

  async deleteHook(keyPath: string, index: number, author: Author): Promise<Oid> {
    let allHooks = await this.getHooks();
    const keyHooks = this._getKeyHooks(allHooks, keyPath);

    if (!keyHooks || !keyHooks.hooks[index])
      throw new Error('deleteHook - The hook to delete does not exist');

    keyHooks.hooks.splice(index, 1);
    if (keyHooks.hooks.length === 0) allHooks = allHooks.filter((hook) => hook.keyPath !== keyPath);

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

  private _getKeyHooks(allHooks: KeyHooks[], keyPath: string): KeyHooks {
    return allHooks.find((hook) => hook.keyPath === keyPath);
  }

  private async _updateHooksFile(hooks: KeyHooks[], author: Author): Promise<Oid> {
    const hooksJson = JSON.stringify(hooks);

    return this._gitTransactionManager.write(async (gitRepo) => {
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

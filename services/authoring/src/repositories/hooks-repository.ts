import Transactor from '../utils/transactor';
import GitRepository from './git-repository';
import { Oid } from 'nodegit';
import Author from '../utils/author';
import { Hook, KeyHooks } from '../utils/hooks';

const hooksFilePath = 'hooks.json';

export default class HooksRepository {
  constructor(private _gitTransactionManager: Transactor<GitRepository>) {}

  getHooks(): Promise<KeyHooks[]> {
    return this._gitTransactionManager.read(async (gitRepo) => {
      const hooksJson = await gitRepo.readFile(hooksFilePath);
      return JSON.parse(hooksJson);
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

  private _getKeyHooks(allHooks: KeyHooks[], keyPath: string): KeyHooks {
    return allHooks.find((hook) => hook.keyPath === keyPath);
  }

  private _updateHooksFile(hooks: KeyHooks[], author: Author): Promise<Oid> {
    const hooksJson = JSON.stringify(hooks);

    return this._gitTransactionManager.write(async (gitRepo) => {
      await gitRepo.updateFile(hooksFilePath, hooksJson);
      return gitRepo.commitAndPush('Updating hooks', author);
    });
  }
}

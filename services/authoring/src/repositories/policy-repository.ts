import Transactor from '../utils/transactor';
import GitRepository from './git-repository';
import { Oid } from 'nodegit';
import { JsonValue } from '../utils/jsonValue';
import jsonpatch = require('fast-json-patch');

export default class PolicyRepository {
  constructor(private _gitTransactionManager: Transactor<GitRepository>) {
  }

  getPolicy(): Promise<JsonValue> {
    return this._gitTransactionManager.read(async (gitRepo) => {
      const policyFileContent = await gitRepo.readFile('policy.json');
      return JSON.parse(policyFileContent);
    });
  }

  replacePolicy(policy: JsonValue, author: { name: string, email: string }): Promise<Oid> {
    return this._gitTransactionManager.write(async (gitRepo) => {
      await gitRepo.updateFile('policy.json', JSON.stringify(policy, null, 4));
      return await gitRepo.commitAndPush(`Updating policy`, author);
    });
  }

  async updatePolicy(patch: jsonpatch.Operation[], author: { name: string, email: string }): Promise<Oid> {
    const currentPolicy = await this.getPolicy();
    const newPolicy = jsonpatch.applyPatch(currentPolicy, patch).newDocument;
    return this.replacePolicy(newPolicy, author);
  }
}

import Transactor from '../utils/transactor';
import GitRepository from './git-repository';
import { Oid } from 'nodegit';
import { JsonValue } from '../utils/jsonValue';
import Author from '../utils/author';
import jsonpatch = require('fast-json-patch');

const getPathToPolicyFile = (resource?: string) =>
  resource ? `implementations/jpad/${resource}/policy.json` : 'security/policy.json';

export default class PolicyRepository {
  constructor(private _gitTransactionManager: Transactor<GitRepository>) {}

  getPolicy(resource?: string): Promise<JsonValue> {
    return this._gitTransactionManager.read(async (gitRepo) => {
      const pathToPolicyFile = getPathToPolicyFile(resource);
      const policyFileContent = await gitRepo.readFile(pathToPolicyFile);
      return JSON.parse(policyFileContent);
    });
  }

  replacePolicy(policy: JsonValue, author: Author, resource?: string): Promise<Oid> {
    return this._gitTransactionManager.write(async (gitRepo) => {
      const pathToPolicyFile = getPathToPolicyFile(resource);
      await gitRepo.updateFile(pathToPolicyFile, JSON.stringify(policy, null, 4));
      return await gitRepo.commitAndPush(`Updating policy`, author);
    });
  }

  async updatePolicy(
    patch: jsonpatch.Operation[],
    author: Author,
    resource?: string,
  ): Promise<Oid> {
    const currentPolicy = await this.getPolicy();
    const newPolicy = jsonpatch.applyPatch(currentPolicy, patch).newDocument;
    return this.replacePolicy(newPolicy, author, resource);
  }
}

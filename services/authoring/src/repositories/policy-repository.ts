import Transactor from '../utils/transactor';
import GitRepository from './git-repository';
import { Oid } from 'nodegit';
import { JsonValue } from '../utils/jsonValue';
import Author from '../utils/author';
import jsonpatch = require('fast-json-patch');

interface Resource {
  path: string;
  isKey: boolean;
}

const getPathToPolicyFile = (resource?: Resource) => {
  if (!resource) {
    return 'security/policy.json';
  }

  return resource.isKey
    ? `manifests/${resource.path}.json`
    : `manifests/${resource.path}/policy.json`;
};

export default class PolicyRepository {
  constructor(private _gitTransactionManager: Transactor<GitRepository>) {}

  getPolicy(resource?: Resource): Promise<JsonValue> {
    return this._gitTransactionManager.read(async (gitRepo) => {
      const pathToPolicyFile = getPathToPolicyFile(resource);
      const policyFileContent = JSON.parse(await gitRepo.readFile(pathToPolicyFile));
      return resource.isKey ? policyFileContent.policies : policyFileContent;
    });
  }

  replacePolicy(policy: JsonValue, author: Author, resource?: Resource): Promise<Oid> {
    return this._gitTransactionManager.write(async (gitRepo) => {
      const pathToPolicyFile = getPathToPolicyFile(resource);
      const policyFileContent = JSON.parse(await gitRepo.readFile(pathToPolicyFile));
      policyFileContent.policies = policy;
      await gitRepo.updateFile(pathToPolicyFile, JSON.stringify(policyFileContent, null, 4));
      return await gitRepo.commitAndPush(`Updating policy`, author);
    });
  }

  async updatePolicy(
    patch: jsonpatch.Operation[],
    author: Author,
    resource?: Resource,
  ): Promise<Oid> {
    const currentPolicy = await this.getPolicy();
    const newPolicy = jsonpatch.applyPatch(currentPolicy, patch).newDocument;
    return this.replacePolicy(newPolicy, author, resource);
  }
}

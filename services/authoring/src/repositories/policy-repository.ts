import Transactor from '../utils/transactor';
import GitRepository from './git-repository';
import { Oid } from 'nodegit';
import { Author, JsonValue } from '../utils';
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

export class PolicyRepository {
  constructor(private _gitTransactionManager: Transactor<GitRepository>) {}

  getPolicy(resource?: Resource): Promise<JsonValue> {
    return this._gitTransactionManager.read(async (gitRepo) => {
      const pathToPolicyFile = getPathToPolicyFile(resource);
      const policyFileContent = JSON.parse(await gitRepo.readFile(pathToPolicyFile));
      return resource && resource.isKey ? policyFileContent.policy : policyFileContent;
    });
  }

  replacePolicy(policy: JsonValue, author: Author, resource?: Resource): Promise<Oid> {
    return this._gitTransactionManager.write(async (gitRepo) => {
      const pathToPolicyFile = getPathToPolicyFile(resource);
      let newPolicy: JsonValue = policy;
      if (resource && resource.isKey) {
        const policyFileContent = JSON.parse(await gitRepo.readFile(pathToPolicyFile));
        newPolicy = { ...policyFileContent, policy: policy };
      }
      await gitRepo.updateFile(pathToPolicyFile, JSON.stringify(newPolicy, null, 4));
      return await gitRepo.commitAndPush(`Updating policy`, author);
    });
  }

  async updatePolicy(
    patch: jsonpatch.Operation[],
    author: Author,
    resource?: Resource,
  ): Promise<Oid> {
    const currentPolicy = await this.getPolicy(resource);
    const newPolicy = jsonpatch.applyPatch(currentPolicy, patch).newDocument;
    return this.replacePolicy(newPolicy, author, resource);
  }
}

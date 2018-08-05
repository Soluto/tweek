import Transactor from '../utils/transactor';
import GitRepository from './git-repository';
import { Oid } from 'nodegit';
import { JsonValue } from '../utils/jsonValue';

export default class PolicyRepository {
  constructor(private _gitTransactionManager: Transactor<GitRepository>) {
  }

  updatePolicy(policy: JsonValue, author: { name: string, email: string }): Promise<Oid> {
    return this._gitTransactionManager.write(async (gitRepo) => {
      await gitRepo.updateFile('policy.json', JSON.stringify(policy, null, 4));
      return await gitRepo.commitAndPush(`Updating policy`, author);
    });
  }
}

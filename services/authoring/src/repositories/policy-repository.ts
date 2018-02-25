import Transactor from '../utils/transactor';
import GitRepository from './git-repository';
import { Oid } from 'nodegit';

export default class PolicyRepository {
  constructor(private _gitTransactionManager: Transactor<GitRepository>) {
  }

  updatePolicy(policy: string, author: { name: string, email: string }): Promise<Oid> {
    return this._gitTransactionManager.write(async (gitRepo) => {
      await gitRepo.updateFile('policy.csv', policy);
      return await gitRepo.commitAndPush(`Updating policy`, author);
    });
  }
}

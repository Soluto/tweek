import Transactor from '../utils/transactor';
import GitRepository from './git-repository';
import { Oid } from 'nodegit';

export default class ExtractionRulesRepository {
  constructor(private _gitTransactionManager: Transactor<GitRepository>) {
  }

  updateExtractionRules(rules: string, author: { name: string, email: string }): Promise<Oid> {
    return this._gitTransactionManager.write(async (gitRepo) => {
      await gitRepo.updateFile('rules.rego', rules);
      return await gitRepo.commitAndPush(`Updating extraction rules`, author);
    });
  }
}

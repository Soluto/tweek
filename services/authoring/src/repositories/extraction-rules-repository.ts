import Transactor from '../utils/transactor';
import GitRepository from './git-repository';
import { Oid } from 'nodegit';

export default class SubjectExtractionRulesRepository {
  constructor(private _gitTransactionManager: Transactor<GitRepository>) {
  }

  updateSubjectExtractionRules(rules: string, author: { name: string, email: string }): Promise<Oid> {
    return this._gitTransactionManager.write(async (gitRepo) => {
      await gitRepo.updateFile('security/subject_extraction_rules.rego', rules);
      return await gitRepo.commitAndPush(`Updating subject extraction rules`, author);
    });
  }
}

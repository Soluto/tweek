class RulesRepository {

  static RULES_REPOSITORY_DIRECTORY_NAME = 'rules';
  static RULES_REPOSITORY_FILE_EXTENSION_NAME = '.jpad';

  constructor(gitRepo) {
    this._gitRepo = gitRepo;
  }

  async getAllRules() {
    return (await this._gitRepo.getFileNames(RulesRepository.RULES_REPOSITORY_DIRECTORY_NAME)).
      map(x => x.replace(RulesRepository.RULES_REPOSITORY_FILE_EXTENSION_NAME, ''));
  }

  async getRule(ruleName) {
    const ruleFile = await this._gitRepo.readFile(this._buildRuleJpadFilePath(ruleName));
    return ruleFile;
  }

  async updateRule(ruleName, payload, author) {
    await this._gitRepo.updateFile(this._buildRuleJpadFilePath(ruleName), payload, author);
  }

  deleteKey(keyPath, author) {
    return this._gitRepo.deleteFile(this._buildRuleJpadFilePath(keyPath), author);
  }

  _buildRuleJpadFilePath(ruleName) {
    return `${RulesRepository.RULES_REPOSITORY_DIRECTORY_NAME}/${ruleName}${RulesRepository.RULES_REPOSITORY_FILE_EXTENSION_NAME}`;
  }
}

export default RulesRepository;

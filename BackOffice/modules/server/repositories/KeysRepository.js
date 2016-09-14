class KeysRepository {

  static KEYS_REPOSITORY_DIRECTORY_NAME = 'rules';
  static KEYS_REPOSITORY_FILE_EXTENSION_NAME = '.jpad';

  constructor(gitRepo) {
    this._gitRepo = gitRepo;
  }

  async getAllKeys() {
    return (await this._gitRepo.getFileNames(KeysRepository.KEYS_REPOSITORY_DIRECTORY_NAME)).
      map(x => x.replace(KeysRepository.KEYS_REPOSITORY_FILE_EXTENSION_NAME, ''));
  }

  async getKey(keyName) {
    const ruleFile = await this._gitRepo.readFile(this._buildRuleJpadFilePath(keyName));
    return ruleFile;
  }

  async updateKey(keyName, payload, author) {
    await this._gitRepo.updateFile(this._buildRuleJpadFilePath(keyName), payload, author);
  }

  deleteKey(keyPath, author) {
    return this._gitRepo.deleteFile(this._buildRuleJpadFilePath(keyPath), author);
  }

  _buildRuleJpadFilePath(keyName) {
    return `${KeysRepository.KEYS_REPOSITORY_DIRECTORY_NAME}/${keyName}${KeysRepository.KEYS_REPOSITORY_FILE_EXTENSION_NAME}`;
  }
}

export default KeysRepository;

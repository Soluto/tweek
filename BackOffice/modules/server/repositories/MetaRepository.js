class MetaRepository {

  static META_REPOSITORY_DIRECTORY_NAME = 'meta'
  static META_REPOSITORY_FILE_EXTENSION_NAME = '.json';

  constructor(gitRepo) {
    this._gitRepo = gitRepo;
  }

  async getRuleMeta(ruleName) {
    return JSON.parse(await this._gitRepo.readFile(this._buildMetaJsonFilePath(ruleName)));
  }

  updateRuleMeta(ruleName, payload, author) {
    console.log('update rule meta', ruleName, payload, author);
    return this._gitRepo.updateFile(this._buildMetaJsonFilePath(ruleName), JSON.stringify(payload), author);
  }

  _buildMetaJsonFilePath(ruleName) {
    return `${MetaRepository.META_REPOSITORY_DIRECTORY_NAME}/${ruleName}${MetaRepository.META_REPOSITORY_FILE_EXTENSION_NAME}`;
  }
}

export default MetaRepository;

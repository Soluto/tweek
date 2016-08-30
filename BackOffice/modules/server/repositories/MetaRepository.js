class MetaRepository {

  static META_REPOSITORY_DIRECTORY_NAME = 'meta'
  static META_REPOSITORY_FILE_EXTENSION_NAME = '.json';

  constructor(gitRepo) {
    this._gitRepo = gitRepo;
  }

  async getRuleMeta(ruleName) {
    const ruleMeta = await this._gitRepo.readFile(this._buildMetaJsonFilePath(ruleName));
    return JSON.parse(ruleMeta.fileContent);
  }

  updateRuleMeta(ruleName, payload, author) {
    return this._gitRepo.updateFile(this._buildMetaJsonFilePath(ruleName), JSON.stringify(payload, null, 4), author);
  }

  deleteKeyMeta(keyPath, author) {
    return this._gitRepo.deleteFile(this._buildMetaJsonFilePath(keyPath), author);
  }

  _buildMetaJsonFilePath(ruleName) {
    return `${MetaRepository.META_REPOSITORY_DIRECTORY_NAME}/${ruleName}${MetaRepository.META_REPOSITORY_FILE_EXTENSION_NAME}`;
  }
}

export default MetaRepository;

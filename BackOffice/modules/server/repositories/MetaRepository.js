class MetaRepository {

  static META_REPOSITORY_DIRECTORY_NAME = 'meta'
  static META_REPOSITORY_FILE_EXTENSION_NAME = '.json';

  constructor(gitRepo) {
    this._gitRepo = gitRepo;
  }

  async getKeyMeta(keyName) {
    const ruleMeta = await this._gitRepo.readFile(this._buildMetaJsonFilePath(keyName));
    return JSON.parse(ruleMeta.fileContent);
  }

  updateRuleMeta(keyName, payload, author) {
    return this._gitRepo.updateFile(this._buildMetaJsonFilePath(keyName), JSON.stringify(payload, null, 4), author);
  }

  deleteKeyMeta(keyPath, author) {
    return this._gitRepo.deleteFile(this._buildMetaJsonFilePath(keyPath), author);
  }

  _buildMetaJsonFilePath(keyName) {
    return `${MetaRepository.META_REPOSITORY_DIRECTORY_NAME}/${keyName}${MetaRepository.META_REPOSITORY_FILE_EXTENSION_NAME}`;
  }
}

export default MetaRepository;

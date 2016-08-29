import R from 'ramda';

class TagsRepository {

  static TAGS_REPOSITORY_FILE_NAME = 'tags.json';

  constructor(gitRepo) {
    this._gitRepo = gitRepo;
  }

  async getTags() {
    return await this._getParsedTags();
  }

  async mergeNewTags(newTags, author) {
    const currentTags = await this._getParsedTags();
    const combined = JSON.stringify(R.uniqBy(x => x.name, [...currentTags, ...newTags]), null, 4);

    return await this._gitRepo.updateFile(TagsRepository.TAGS_REPOSITORY_FILE_NAME, combined, author);
  }

  async _getParsedTags() {
    try {
      const tagsFile = await this._gitRepo.readFile(TagsRepository.TAGS_REPOSITORY_FILE_NAME);
      return JSON.parse(tagsFile.fileContent);
    } catch (exp) {
      return [];
    }
  }
}

export default TagsRepository;

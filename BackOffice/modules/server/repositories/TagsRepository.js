class TagsRepository {

  static TAGS_REPOSITORY_FILE_NAME = 'tags.json';

  constructor(gitRepo) {
    this._gitRepo = gitRepo;
  }

  async getTags() {
    return JSON.parse(await this._gitRepo.readFile(TagsRepository.TAGS_REPOSITORY_FILE_NAME));
  }
}

export default TagsRepository;

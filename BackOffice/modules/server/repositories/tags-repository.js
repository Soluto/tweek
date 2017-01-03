import { uniqBy } from "ramda";

const TagsFile = "tags.json";

export default class TagsRepository {
  constructor(gitTransactionManager){
    this._gitTransactionManager = gitTransactionManager;
  }

  async getTags() {
    return await this._gitTransactionManager.read(async gitRepo => {
      return JSON.parse(await gitRepo.readFile(TagsFile));
    });
  }

  async mergeTags (tagsToSave, author) {
    await this._gitTransactionManager.write(async gitRepo => {
      const currentTags = JSON.parse(await gitRepo.readFile(TagsFile));
      const changedTags = tagsToSave.map(x => ({name: x}));

      const newTags = uniqBy(x => x.name, [...currentTags, ...changedTags]);

      await gitRepo.updateFile(TagsFile, JSON.stringify(newTags, null, 4));

      await gitRepo.commitAndPush("BackOffice - updating tags", author);
    });
  };
}

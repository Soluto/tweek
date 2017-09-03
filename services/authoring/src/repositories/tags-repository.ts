import { uniqBy } from 'ramda';
import Transactor from "../utils/transactor";
import GitRepository from "./git-repository";

const TagsFile = 'tags.json';

export default class TagsRepository {
  constructor(private _gitTransactionManager: Transactor<GitRepository>) {
  }

  async getTags() {
    return await this._gitTransactionManager.with(async gitRepo =>
      JSON.parse(await gitRepo.readFile(TagsFile)),
    );
  }

  async mergeTags(tagsToSave, author) {
    await this._gitTransactionManager.write(async (gitRepo) => {
      const currentTags = JSON.parse(await gitRepo.readFile(TagsFile));
      const changedTags = tagsToSave.map(x => ({ name: x }));

      const newTags = uniqBy(x => x.name, [...currentTags, ...changedTags]);

      await gitRepo.updateFile(TagsFile, JSON.stringify(newTags, null, 4));

      await gitRepo.commitAndPush('Editor - updating tags', author);
    });
  }
}

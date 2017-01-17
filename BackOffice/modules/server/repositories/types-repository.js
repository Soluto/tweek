import { uniqBy } from "ramda";

const TYPES_FILE = "types.json";

export default class TypesRepository {
  constructor(gitTransactionManager) {
    this._gitTransactionManager = gitTransactionManager;
  }

  async getTypes() {
    return await this._gitTransactionManager.read(async gitRepo => {
      return JSON.parse(await gitRepo.readFile(TYPES_FILE));
    });
  }
}

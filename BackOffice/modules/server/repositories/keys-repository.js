import path from 'path';

const BasePathForRules = "rules";

export default class KeysRepository {
  constructor(gitTransactionManager){
    this._gitTransactionManager = gitTransactionManager;
  }

  async getAllKeys() {
    return await this._gitTransactionManager.read(async gitRepo => {
      const keyFiles = await gitRepo.listFiles(BasePathForRules);

      return keyFiles.map(getKeyFromJPadPath);
    });
  }

  async getKeyDetails(keyPath){
    return await this._gitTransactionManager.read(async gitRepo => {
      let pathForJPad = getPathForJPad(keyPath);
      let pathForMeta = getPathForMeta(keyPath);

      let ruleHistory = await gitRepo.getFileDetails(pathForJPad);
      let jpadSource = await gitRepo.readFile(pathForJPad);
      let metaSource = await gitRepo.readFile(pathForMeta);

      return {
        keyDef: {
          type: path.extname(pathForJPad).substring(1),
          source: jpadSource,
          modificationData: ruleHistory
        },
        meta: JSON.parse(metaSource)
      }
    });
  }

  async updateKey(keyPath, keyMetaSource, keyRulesSource, author) {
    await this._gitTransactionManager.write(async gitRepo => {
      await gitRepo.updateFile(getPathForMeta(keyPath), keyMetaSource);
      await gitRepo.updateFile(getPathForJPad(keyPath), keyRulesSource);

      await gitRepo.commitAndPush("BackOffice - updating " + keyPath, author)
    });
  }

  async deleteKey(keyPath, author) {
    await this._gitTransactionManager.write(async gitRepo => {
      await gitRepo.deleteFile(getPathForMeta(keyPath));
      await gitRepo.deleteFile(getPathForJPad(keyPath));

      await gitRepo.commitAndPush("BackOffice - deleting " + keyPath, author)
    });
  }
}

function getPathForJPad(keyName) {
  return `${BasePathForRules}/${keyName}.jpad`;
}

function getPathForMeta(keyName) {
  return `meta/${keyName}.json`;
}

function getKeyFromJPadPath(keyPath){
  const ext = path.extname(keyPath);
  return keyPath.substring(0, keyPath.length - ext.length);
}

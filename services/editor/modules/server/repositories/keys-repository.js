import path from 'path';

const BasePathForRules = "rules";

export default class KeysRepository {
  constructor(gitTransactionManager) {
    this._gitTransactionManager = gitTransactionManager;
  }

  async getAllKeys() {
    return await this._gitTransactionManager.read(async gitRepo => {
      const keyFiles = await gitRepo.listFiles(BasePathForRules);

      return keyFiles.map(getKeyFromJPadPath);
    });
  }

  async getKeyDetails(keyPath, { revision } = {}) {
    return await this._gitTransactionManager.read(async gitRepo => {
      let pathForJPad = getPathForJPad(keyPath);
      let pathForMeta = getPathForMeta(keyPath);

      let jpadSource = await gitRepo.readFile(pathForJPad, { revision });
      jpadSource = getNewJpadFormatSourceIfNeeded(jpadSource);

      let meta = null;
      try {
        meta = JSON.parse(await gitRepo.readFile(pathForMeta, { revision }));
      } catch (exp) {
        console.warn('failed getting meta file', exp.message);
      }

      let revisionHistory = await gitRepo.getFileDetails(pathForJPad, { revision });
      return {
        keyDef: {
          type: path.extname(pathForJPad).substring(1),
          source: jpadSource,
          revisionHistory
        },
        meta,
      }
    });
  }

  async updateKey(keyPath, keyMetaSource, keyRulesSource, author) {
    await this._gitTransactionManager.write(async gitRepo => {
      await gitRepo.updateFile(getPathForMeta(keyPath), keyMetaSource);
      await gitRepo.updateFile(getPathForJPad(keyPath), keyRulesSource);

      await gitRepo.commitAndPush("BackOffice - updating " + keyPath, author);
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

function getNewJpadFormatSourceIfNeeded(originalJpadSource) {
  const parsedJpad = JSON.parse(originalJpadSource);
  if (!Array.isArray(parsedJpad)) return originalJpadSource;

  return JSON.stringify({
    partitions: [],
    valueType: 'string',
    rules: parsedJpad,
  });
}

function getPathForJPad(keyName) {
  return `${BasePathForRules}/${keyName}.jpad`;
}

function getPathForMeta(keyName) {
  return `meta/${keyName}.json`;
}

function getKeyFromJPadPath(keyPath) {
  const ext = path.extname(keyPath);
  return keyPath.substring(0, keyPath.length - ext.length);
}
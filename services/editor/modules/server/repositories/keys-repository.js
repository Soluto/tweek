import path from 'path';

const BasePathForRules = 'rules';

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

export default class KeysRepository {
  constructor(gitTransactionManager) {
    this._gitTransactionManager = gitTransactionManager;
  }

  getAllKeys() {
    return this._gitTransactionManager.read(async (gitRepo) => {
      const keyFiles = await gitRepo.listFiles(BasePathForRules);

      return keyFiles.map(getKeyFromJPadPath);
    });
  }

  getKeyDetails(keyPath, { revision } = {}) {
    return this._gitTransactionManager.read(async (gitRepo) => {
      const pathForJPad = getPathForJPad(keyPath);
      const pathForMeta = getPathForMeta(keyPath);

      let jpadSource = await gitRepo.readFile(pathForJPad, { revision });
      jpadSource = getNewJpadFormatSourceIfNeeded(jpadSource);

      let meta = null;
      try {
        meta = JSON.parse(await gitRepo.readFile(pathForMeta, { revision }));
      } catch (exp) {
        console.warn('failed getting meta file', exp.message);
      }

      const revisionHistory = await gitRepo.getFileDetails(pathForJPad);
      return {
        revisionHistory,
        keyDef: {
          type: path.extname(pathForJPad).substring(1),
          source: jpadSource,
        },
        meta,
      };
    });
  }

  getKeyMeta(keyPath, { revision } = {}) {
    return this._gitTransactionManager.read(async (gitRepo) => {
      const pathForMeta = getPathForMeta(keyPath);
      return JSON.parse(await gitRepo.readFile(pathForMeta, { revision }));
    });
  }

  updateKey(keyPath, keyMetaSource, keyRulesSource, author) {
    return this._gitTransactionManager.write(async (gitRepo) => {
      await gitRepo.updateFile(getPathForMeta(keyPath), keyMetaSource);
      await gitRepo.updateFile(getPathForJPad(keyPath), keyRulesSource);

      await gitRepo.commitAndPush(`Editor - updating ${keyPath}`, author);
    });
  }

  deleteKey(keyPath, author) {
    return this._gitTransactionManager.write(async (gitRepo) => {
      await gitRepo.deleteFile(getPathForMeta(keyPath));
      await gitRepo.deleteFile(getPathForJPad(keyPath));

      await gitRepo.commitAndPush(`Editor - deleting ${keyPath}`, author);
    });
  }
}

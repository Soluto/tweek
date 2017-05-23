import path from 'path';
import R from 'ramda';

function generateEmptyMeta(keyPath) {
  return ({
    key_path: keyPath,
    meta: {
      name: keyPath,
      description: '',
      tags: [],
      readOnly: false,
      archived: false,
    },
    implementation: {
      type: 'file',
      format: 'jpad',
    },
    valueType: 'string',
    enabled: true,
    dependencies: [],
  });
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

function getPathForMeta(keyName) {
  return `meta/${keyName}.json`;
}

function getPathForSourceFile(meta) {
  return `rules/${meta.key_path}.${meta.implementation.format}`;
}

function getKeyFromPath(keyPath) {
  const ext = path.extname(keyPath);
  return keyPath.substring(0, keyPath.length - ext.length);
}

async function getKeyDef(meta, repo, revision) {
  if (meta.implementation.type === 'file') {
    const keyDef = {
      source: await repo.readFile(getPathForSourceFile(meta), { revision }),
      type: meta.implementation.format,
    };
    if (meta.implementation.format === 'jpad') {
      keyDef.source = getNewJpadFormatSourceIfNeeded(keyDef.source);
    }
    return keyDef;
  }
  if (meta.implementation.type === 'const') {
    return { source: meta.implementation.value, type: 'const' };
  }
  throw new Error('unsupported type');
}

async function getRevisionHistory(meta, repo) {
  const fileMeta = (meta.implementation.type === 'file') ?
    repo.getHistory(`rules/${meta.key_path}.${meta.implementation.format}`) : Promise.resolve([]);

  return R.uniqBy(x => x.sha, [...(await repo.getHistory(`meta/${meta.key_path}.json`)), ...(await fileMeta)]);
}

async function getMetaFile(keyPath, gitRepo, revision) {
  const pathForMeta = getPathForMeta(keyPath);
  try {
    return JSON.parse(await gitRepo.readFile(pathForMeta, { revision }));
  } catch (exp) {
    return generateEmptyMeta(keyPath);
  }
}

export default class KeysRepository {
  constructor(gitTransactionManager) {
    this._gitTransactionManager = gitTransactionManager;
  }

  getAllKeys() {
    return this._gitTransactionManager.read(async (gitRepo) => {
      const keyFiles = await gitRepo.listFiles('meta');

      return keyFiles.map(getKeyFromPath);
    });
  }

  getKeyDetails(keyPath, { revision } = {}) {
    return this._gitTransactionManager.read(async (gitRepo) => {
      const meta = await getMetaFile(keyPath, gitRepo, revision);
      const keyDef = getKeyDef(meta, gitRepo, revision);
      const revisionHistory = getRevisionHistory(meta, gitRepo);
      return {
        revisionHistory: await revisionHistory,
        keyDef: await keyDef,
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
      // if changing implementation type will be possible in the future, we'll might need better solution
      await gitRepo.updateFile(getPathForMeta(keyPath), keyMetaSource);
      const meta = JSON.parse(keyMetaSource);
      if (meta.implementation.type === 'file') {
        await gitRepo.updateFile(getPathForSourceFile(meta), keyRulesSource);
      }
      await gitRepo.commitAndPush(`Editor - updating ${keyPath}`, author);
    });
  }

  deleteKey(keyPath, author) {
    return this._gitTransactionManager.write(async (gitRepo) => {
      const meta = await getMetaFile(keyPath);
      await gitRepo.deleteFile(getPathForMeta(keyPath));
      if (meta.implementation.type === 'file') {
        await gitRepo.deleteFile(getPathForSourceFile(meta));
      }

      await gitRepo.commitAndPush(`Editor - deleting ${keyPath}`, author);
    });
  }
}

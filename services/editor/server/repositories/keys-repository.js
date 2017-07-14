import path from 'path';
import R from 'ramda';
import { convertMetaToNewFormat } from '../utils/meta-legacy';

function generateEmptyManifest(keyPath) {
  return {
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
  };
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

function getPathForManifest(keyName) {
  return `meta/${keyName}.json`;
}

function getPathForSourceFile(manifest) {
  return `rules/${manifest.key_path}.${manifest.implementation.format}`;
}

function getKeyFromPath(keyPath) {
  const ext = path.extname(keyPath);
  return keyPath.substring(0, keyPath.length - ext.length);
}

async function updateKey(gitRepo, keyPath, manifest, fileImplementation) {
  await gitRepo.updateFile(getPathForManifest(keyPath), JSON.stringify(manifest, null, 4));
  if (manifest.implementation.type === 'file') {
    await gitRepo.updateFile(getPathForSourceFile(manifest), fileImplementation);
  }
}

async function getKeyDef(manifest, repo, revision) {
  if (manifest.implementation.type === 'file') {
    const keyDef = {
      source: await repo.readFile(getPathForSourceFile(manifest), { revision }),
      type: manifest.implementation.format,
    };
    if (manifest.implementation.format === 'jpad') {
      keyDef.source = getNewJpadFormatSourceIfNeeded(keyDef.source);
    }
    return keyDef;
  }
  if (manifest.implementation.type === 'const') {
    return { source: JSON.stringify(manifest.implementation.value), type: 'const' };
  }
  throw new Error('unsupported type');
}

async function getRevisionHistory(manifest, repo) {
  const fileMeta = manifest.implementation.type === 'file'
    ? repo.getHistory(`rules/${manifest.key_path}.${manifest.implementation.format}`)
    : Promise.resolve([]);

  const uniqSort = R.pipe(R.uniqBy(R.prop('sha')), R.sort(R.descend(R.prop('date'))));
  return uniqSort([
    ...(await repo.getHistory(`meta/${manifest.key_path}.json`)),
    ...(await fileMeta),
  ]);
}

async function getManifestFile(keyPath, gitRepo, revision) {
  const pathForManifest = getPathForManifest(keyPath);
  try {
    const manifest = JSON.parse(await gitRepo.readFile(pathForManifest, { revision }));
    return manifest.meta ? manifest : convertMetaToNewFormat(keyPath, { manifest });
  } catch (exp) {
    return generateEmptyManifest(keyPath);
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

  getAllManifests(prefix = '') {
    return this._gitTransactionManager.with(async (gitRepo) => {
      const normalizedPrefix = `${path.normalize(`meta/${prefix}/.`)}`.replace(/\\/g, '/');
      const files = await gitRepo.listFiles(normalizedPrefix);
      const manifestFiles = files.map(path => `${normalizedPrefix}/${path}`);
      const manifests = await Promise.all(
        manifestFiles.map(pathForManifest => gitRepo.readFile(pathForManifest)),
      );
      return manifests.map(JSON.parse);
    });
  }

  getKeyDetails(keyPath, { revision } = {}) {
    return this._gitTransactionManager.with(async (gitRepo) => {
      const manifest = await getManifestFile(keyPath, gitRepo, revision);
      const keyDef = getKeyDef(manifest, gitRepo, revision);
      return {
        keyDef: await keyDef,
        manifest,
      };
    });
  }

  getKeyManifest(keyPath, { revision } = {}) {
    return this._gitTransactionManager.with(async (gitRepo) => {
      const pathForManifest = getPathForManifest(keyPath);
      return JSON.parse(await gitRepo.readFile(pathForManifest, { revision }));
    });
  }

  getKeyRevisionHistory(keyPath) {
    return this._gitTransactionManager.read(async (gitRepo) => {
      const manifest = await getManifestFile(keyPath, gitRepo);
      return getRevisionHistory(manifest, gitRepo);
    });
  }

  updateKey(keyPath, manifest, fileImplementation, author) {
    return this._gitTransactionManager.write(async (gitRepo) => {
      await updateKey(gitRepo, keyPath, manifest, fileImplementation);
      await gitRepo.commitAndPush(`Editor - updating ${keyPath}`, author);
    });
  }

  deleteKey(keyPath, author) {
    return this._gitTransactionManager.write(async (gitRepo) => {
      const manifest = await getManifestFile(keyPath, gitRepo);
      await gitRepo.deleteFile(getPathForManifest(keyPath));
      if (manifest.implementation.type === 'file') {
        await gitRepo.deleteFile(getPathForSourceFile(manifest));
      }

      await gitRepo.commitAndPush(`Editor - deleting ${keyPath}`, author);
    });
  }

  getRevision() {
    return this._gitTransactionManager.read(gitRepo => gitRepo.getLastCommit());
  }
}

import path from 'path';

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
  return `manifests/${keyName}.json`;
}

function getPathForSourceFile(manifest) {
  return `implementations/${manifest.key_path}.${manifest.implementation.format}`;
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
  const files = [
    `meta/${manifest.key_path}.json`,
    `manifests/${manifest.key_path}.json`,
  ];

  if (manifest.implementation.type === 'file') {
    files.concat(
      `rules/${manifest.key_path}.${manifest.implementation.format}`,
      `implementations/${manifest.key_path}.${manifest.implementation.format}`
    );
  }

  return await repo.getHistory(files);
}

async function getManifestFile(keyPath, gitRepo, revision) {
  const pathForManifest = getPathForManifest(keyPath);
  try {
    return JSON.parse(await gitRepo.readFile(pathForManifest, { revision }));
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
      const keyFiles = await gitRepo.listFiles('manifests');

      return keyFiles.map(getKeyFromPath);
    });
  }

  getAllManifests(prefix = '') {
    return this._gitTransactionManager.with(async (gitRepo) => {
      const normalizedPrefix = `${path.normalize(`manifests/${prefix}/.`)}`.replace(/\\/g, '/');
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
      const manifest = await getManifestFile(keyPath);
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

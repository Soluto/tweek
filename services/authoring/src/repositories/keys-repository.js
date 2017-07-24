const path = require('path');

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

//todo remove legacy
function getLegacyPathForManifest(keyName) {
  return `meta/${keyName}.json`;
}

function getLegacyPathForSourceFile(manifest) {
  return `rules/${manifest.key_path}.${manifest.implementation.format}`;
}

function getPathForManifest(keyName) {
  return `manifests/${keyName}.json`;
}

function getPathForSourceFile(manifest) {
  return `implementations/${manifest.implementation.format}/${manifest.key_path}.${manifest.implementation.extension || manifest.implementation.format}`;
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
  switch (manifest.implementation.type) {
  case 'file':
    let source;
    try {
      source = await repo.readFile(getPathForSourceFile(manifest), { revision });
    } catch (err) {
      source = await repo.readFile(getLegacyPathForSourceFile(manifest), { revision });
    }
    const keyDef = {
      source,
      type: manifest.implementation.format,
    };
    if (manifest.implementation.format === 'jpad') {
      keyDef.source = getNewJpadFormatSourceIfNeeded(keyDef.source);
    }
    return keyDef;

  case 'const':
    return { source: JSON.stringify(manifest.implementation.value), type: 'const' };

  default:
    throw new Error('unsupported type');
  }
}

async function getRevisionHistory(manifest, repo, config) {
  const files = [
    getPathForManifest(manifest.key_path),
  ];

  if (manifest.implementation.type === 'file') {
    files.push(
      getPathForSourceFile(manifest),
    );
  }

  return await repo.getHistory(files, config);
}

async function getManifestFile(keyPath, gitRepo, revision) {
  try {
    let fileContent;
    try {
      const pathForManifest = getPathForManifest(keyPath);
      fileContent = await gitRepo.readFile(pathForManifest, { revision });
    } catch (exp) {
      const pathForManifest = getLegacyPathForManifest(keyPath);
      fileContent = await gitRepo.readFile(pathForManifest, { revision });
    }
    return JSON.parse(fileContent);
  } catch (exp) {
    return generateEmptyManifest(keyPath);
  }
}

class KeysRepository {
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

  getKeyRevisionHistory(keyPath, config) {
    return this._gitTransactionManager.with(async (gitRepo) => {
      const manifest = await getManifestFile(keyPath, gitRepo);
      return getRevisionHistory(manifest, gitRepo, config);
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

module.exports = KeysRepository;

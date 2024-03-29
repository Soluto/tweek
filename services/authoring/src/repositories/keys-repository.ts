import path = require('path');
import hash from 'object-hash';
import Transactor from '../utils/transactor';
import GitRepository from './git-repository';

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
  if (!Array.isArray(parsedJpad)) {
    return originalJpadSource;
  }

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
  return `implementations/${manifest.implementation.format}/${manifest.key_path}.${
    manifest.implementation.extension || manifest.implementation.format
  }`;
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

async function getFileImplementation(manifest, repo, revision) {
  let source = await repo.readFile(getPathForSourceFile(manifest), { revision });

  if (manifest.implementation.format === 'jpad') {
    source = getNewJpadFormatSourceIfNeeded(source);
  }
  return source;
}

async function getRevisionHistory(manifest, repo, config) {
  const files = [getPathForManifest(manifest.key_path)];

  if (manifest.implementation.type === 'file') {
    files.push(getPathForSourceFile(manifest));
  }

  return await repo.getHistory(files, config);
}

async function getManifestFile(keyPath: string, gitRepo, revision?: string) {
  try {
    const pathForManifest = getPathForManifest(keyPath);
    const fileContent = await gitRepo.readFile(pathForManifest, { revision });
    return JSON.parse(fileContent);
  } catch (exp) {
    return generateEmptyManifest(keyPath);
  }
}

export default class KeysRepository {
  constructor(private _gitTransactionManager: Transactor<GitRepository>) {}

  getAllKeys() {
    return this._gitTransactionManager.with(async (gitRepo) => {
      const keyFiles = await gitRepo.listFiles('manifests');

      return keyFiles.map(getKeyFromPath);
    });
  }

  getAllManifests(prefix = '') {
    return this._gitTransactionManager.with(async (gitRepo) => {
      const normalizedPrefix = `${path.normalize(`manifests/${prefix}/.`)}`.replace(/\\/g, '/');
      const files = await gitRepo.listFiles(normalizedPrefix);
      const manifestFiles = files.map((keyPath) => `${normalizedPrefix}/${keyPath}`);
      const manifests = await Promise.all(manifestFiles.map((pathForManifest) => gitRepo.readFile(pathForManifest)));
      return manifests.map(<any>JSON.parse);
    });
  }

  getKeyDetails(keyPath, { revision }: any = {}) {
    return this._gitTransactionManager.with(async (gitRepo) => {
      const manifest = await getManifestFile(keyPath, gitRepo, revision);
      return {
        manifest,
        implementation:
          manifest.implementation.type === 'file'
            ? await getFileImplementation(manifest, gitRepo, revision)
            : undefined,
      };
    });
  }

  getKeyManifest(keyPath, { revision }: any = {}) {
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
      return await gitRepo.commitAndPush(`Editor - updating ${keyPath}`, author);
    });
  }

  updateBulkKeys(files, author, commitMessage = 'Bulk update through API') {
    return this._gitTransactionManager.write(async (gitRepo) => {
      for (const file of files) {
        const content = await file.read();
        await gitRepo.updateFile(file.name, content);
      }
      return await gitRepo.commitAndPush(commitMessage, author);
    });
  }

  deleteKeys(keys: string[], author) {
    return this._gitTransactionManager.write(async (gitRepo) => {
      for (const keyPath of keys) {
        const manifest = await getManifestFile(keyPath, gitRepo);
        await gitRepo.deleteFile(getPathForManifest(keyPath));
        if (manifest.implementation.type === 'file') {
          await gitRepo.deleteFile(getPathForSourceFile(manifest));
        }
      }
      return await gitRepo.commitAndPush(`Editor - deleting keys: ${keys.join(', ')}`, author);
    });
  }

  getRevision() {
    return this._gitTransactionManager.with((gitRepo) => gitRepo.getLastCommit());
  }

  async getKeyETag(keyPath: string): Promise<string> {
    const keyDetails = await this.getKeyDetails(keyPath);
    return hash(keyDetails);
  }

  async validateKeyETag(keyPath: string, etag: string): Promise<boolean> {
    const currentETag = await this.getKeyETag(keyPath);
    return etag === currentETag;
  }
}

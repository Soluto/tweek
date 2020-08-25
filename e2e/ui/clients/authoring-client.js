import { expect } from 'chai';
import { waitFor } from '../utils/assertion-utils';
import { tweekManagementClient } from './tweek-clients';

export const waitForKeyToBeDeleted = async (keyPath) => {
  await waitFor(async () => {
    try {
      await tweekManagementClient.getKeyDefinition(keyPath);
    } catch (e) {
      return;
    }
    throw new Error(`key '${keyPath}' still exists`);
  });
};

export const emptyJpad = (valueType = 'string') => ({
  partitions: [],
  valueType,
  rules: [],
});

export const createManifest = (key_path, valueType, implementation, dependencies = []) => ({
  key_path,
  valueType,
  meta: {
    name: key_path,
    tags: [],
    description: '',
  },
  implementation,
  dependencies,
});

export const jpadManifest = (key_path, valueType = 'string') =>
  createManifest(key_path, valueType, {
    type: 'file',
    format: 'jpad',
  });

export const constManifest = (key_path, value, valueType = typeof value) =>
  createManifest(key_path, valueType, {
    type: 'const',
    value,
  });

export const aliasManifest = (key_path, alias) => ({
  key_path: alias,
  meta: {
    archived: false,
  },
  implementation: {
    type: 'alias',
    key: key_path,
  },
});

export const archived = ({ meta, ...manifest }) => ({
  ...manifest,
  meta: { ...meta, archived: true },
});

export const createEmptyJPadKey = async (keyPath, valueType = 'string') => {
  const implementation = emptyJpad(valueType);

  await tweekManagementClient.saveKeyDefinition(keyPath, {
    manifest: jpadManifest(keyPath, valueType),
    implementation: JSON.stringify(implementation),
  });
};

export const waitForImplementation = async (keyPath, expected) => {
  await waitFor(async () => {
    const { implementation } = await tweekManagementClient.getKeyDefinition(keyPath);
    expect(JSON.parse(implementation)).to.deep.equal(expected);
  });
};

export const createConstKey = async (keyPath, value, valueType = typeof value) => {
  await tweekManagementClient.saveKeyDefinition(keyPath, {
    manifest: constManifest(keyPath, value, valueType),
  });
};

export const createAlias = async (keyPath, alias) => {
  await tweekManagementClient.saveKeyDefinition(alias, {
    manifest: aliasManifest(keyPath, alias),
  });
};

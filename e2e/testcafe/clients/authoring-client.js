import { expect } from 'chai';
import { waitFor } from '../utils/assertion-utils';
import { tweekManagementClient } from './tweek-clients';

export const deleteKey = async (keyPath) => {
  await tweekManagementClient.deleteKey(keyPath);
  await waitForKeyToBeDeleted(keyPath);
};

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

export const jpadManifest = (key_path, valueType = 'string') => ({
  key_path,
  valueType,
  meta: {
    name: key_path,
    tags: [],
    description: '',
  },
  implementation: {
    type: 'file',
    format: 'jpad',
  },
  dependencies: [],
});

export const createEmptyKey = async (keyPath, valueType = 'string') => {
  const implementation = emptyJpad(valueType);

  await tweekManagementClient.saveKeyDefinition(keyPath, {
    manifest: jpadManifest(keyPath, valueType),
    implementation: JSON.stringify(implementation),
  });

  await waitForImplementation(keyPath, implementation);
};

export const waitForImplementation = async (keyPath, expected) => {
  await waitFor(async () => {
    const { implementation } = await tweekManagementClient.getKeyDefinition(keyPath);
    expect(JSON.parse(implementation)).to.deep.equal(expected);
  });
};

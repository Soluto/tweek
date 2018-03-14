export const BLANK_KEY_NAME = '_blank';

export function createBlankKeyManifest(keyName, implementation = { type: 'file', format: 'jpad' }) {
  const manifest = {
    key_path: keyName,
    meta: {
      archived: false,
    },
    implementation,
  };

  if (implementation.type !== 'alias') {
    manifest.valueType = 'string';
    manifest.dependencies = [];
    manifest.meta = {
      ...manifest.meta,
      name: keyName,
      description: '',
      tags: [],
    };
  }

  return manifest;
}

export function createJPadSource(valueType = '', rules = [], partitions = []) {
  return JSON.stringify({ valueType, rules, partitions }, null, 4);
}

export function createBlankJPadKey() {
  return {
    implementation: {
      source: createJPadSource('string'),
      type: 'jpad',
      valueType: '',
    },
    manifest: createBlankKeyManifest('', {
      type: 'file',
      format: 'jpad',
    }),
    key: BLANK_KEY_NAME,
  };
}

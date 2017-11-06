export const BLANK_KEY_NAME = '_blank';

export function createBlankKeyManifest(keyName, implementation = { type: 'file', format: 'jpad' }) {
  return {
    meta: {
      name: '',
      tags: [],
      description: '',
      archived: false,
    },
    implementation,
    valueType: '',
    dependencies: [],
    enabled: true,
  };
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

export function createBlankKey() {
  return {
    implementation: {
      source: '',
      type: '',
      valueType: '',
    },
    manifest: createBlankKeyManifest('', {
      type: '',
      format: '',
    }),
    key: BLANK_KEY_NAME,
  };
}

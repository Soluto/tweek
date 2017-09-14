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

export function createBlankJPadKey() {
  const keyDefSource = {
    partitions: [],
    valueType: '',
    rules: [],
  };

  return {
    implementation: {
      source: JSON.stringify(keyDefSource, null, 4),
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

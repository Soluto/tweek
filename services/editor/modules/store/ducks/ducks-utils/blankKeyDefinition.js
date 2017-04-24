export const BLANK_KEY_NAME = '_blank';

export function createBlankKeyMeta(keyName) {
  return {
    displayName: keyName || '',
    description: '',
    tags: [],
    valueType: '',
    archived: false,
    enabled: true,
  };
}

export function createBlankKey() {
  const keyDefSource = {
    partitions: [],
    valueType: '',
    rules: [],
  };

  return {
    keyDef: {
      source: JSON.stringify(keyDefSource, null, 4),
      type: 'jpad',
      valueType: '',
    },
    meta: createBlankKeyMeta(),
    key: BLANK_KEY_NAME,
  };
}

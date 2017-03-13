import Chance from 'chance';
const chance = new Chance();

export const BLANK_KEY_NAME = '_blank';
export function createBlankKey() {
  const guid = chance.guid();
  const keyDefSource = {
    partitions: [],
    valueType: '',
    rules: [{
      Id: guid,
      Matcher: {},
      Value: '',
      Type: 'SingleVariant',
    }]
  };

  return {
    keyDef: {
      source: JSON.stringify(keyDefSource, null, 4),
      type: 'jpad',
      valueType: '',
      partitions: [],
    },
    meta: createBlankKeyMeta(),
    key: BLANK_KEY_NAME,
  };
}

export function createBlankKeyMeta(keyName) {
  return {
    displayName: keyName || '',
    description: '',
    tags: [],
    valueType: '',
  }
}

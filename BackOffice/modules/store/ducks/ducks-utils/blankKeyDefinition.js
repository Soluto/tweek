import Chance from 'chance';
const chance = new Chance();

export const BLANK_KEY_NAME = '_blank';
export function createBlankKey() {
  const guid = chance.guid();
  const keyDefSource = {
    Partitions: [],
    ValueType: '',
    Rules: [{
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
    },
    meta: {
      displayName: '',
      description: '',
      tags: [],
      valueType: '',
    },
    key: BLANK_KEY_NAME,
  };
}

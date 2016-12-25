import Chance from 'chance';
const chance = new Chance();

export const BLANK_KEY_NAME = '_blank';
export function createBlankKey() {
  const guid = chance.guid();
  const keyDefSource = [{
    Id: guid,
    Matcher: {},
    Value: '',
    Type: 'SingleVariant',
  }];

  return {
    keyDef: {
      source: JSON.stringify(keyDefSource, null, 4),
      type: 'jpad',
    },
    meta: {
      displayName: '',
      description: '',
      tags: [],
    },
    key: '_blank',
    isLoaded: true,
  };
}

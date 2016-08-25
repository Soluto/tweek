import Chance from 'chance';
const chance = new Chance();

export const BLANK_KEY_NAME = '_blank';
export function createBlankKey() {
  const guid = chance.guid();
  const ruleDefSource = [{
    Id: guid,
    Matcher: {},
    Value: '',
    Type: 'SingleVariant',
  }];

  return {
    ruleDef: {
      source: JSON.stringify(ruleDefSource, null, 4),
      type: 'jpad',
    },
    meta: {
      displayName: '',
      description: '',
      tags: [],
    },
    key: '_blank',
  };
}

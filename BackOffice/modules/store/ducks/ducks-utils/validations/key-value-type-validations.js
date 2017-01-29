import { types } from '../../../../services/TypesService';

function isExistingType(type) {
  return Object.keys(types)
    .map(x => types[x])
    .some(x => type === x.type || type === x.typeAlias);
}

export default function (keyValueType) {
  if (!keyValueType) {
    return { isValid: false, hint: 'Empty key value type' };
  }

  const isExists = isExistingType(keyValueType);
  return { isValid: isExists, hint: !isExists ? 'Invalid type' : undefined };
};
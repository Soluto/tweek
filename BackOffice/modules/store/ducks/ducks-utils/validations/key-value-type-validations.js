import { types, getTypeMeta } from '../../../../services/TypesService';

function isExistingType(type) {
  return !!getTypeMeta(type);
}

export default function (keyValueType) {
  if (!keyValueType) {
    return { isValid: false, hint: 'Empty key value type' };
  }

  const isExists = isExistingType(keyValueType);
  return { isValid: isExists, hint: !isExists ? 'Invalid type' : undefined };
};
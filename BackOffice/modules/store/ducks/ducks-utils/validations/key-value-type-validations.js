import * as TypesService from '../../../../services/types-service';

function isExistingType(type) {
  return !!TypesService.types[type];
}

export default function (keyValueType) {
  if (!keyValueType) {
    return { isValid: false, hint: 'Empty key value type' };
  }

  const isExists = isExistingType(keyValueType);
  return { isValid: isExists, hint: !isExists ? 'Invalid type' : undefined };
};
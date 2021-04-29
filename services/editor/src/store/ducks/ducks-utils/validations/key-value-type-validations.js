import * as TypesService from '../../../../services/types-service';

export default function keyValueTypeValidations(keyValueType) {
  if (!keyValueType) {
    return { isValid: false, hint: 'Empty key value type' };
  }

  const isExists = !!TypesService.types[keyValueType];
  return { isValid: isExists, hint: !isExists ? 'Invalid type' : undefined };
}

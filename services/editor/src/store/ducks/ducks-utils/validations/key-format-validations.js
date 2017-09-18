import { isValidFormat } from '../../../../utils/keyFormatHelpers';

export default function (keyFormat) {
  if (!keyFormat) {
    return { isValid: false, hint: 'Empty key format' };
  }

  const isValid = isValidFormat(keyFormat);
  const hint = !isValid ? `Invalid format ${keyFormat}` : undefined;
  return { isValid, hint };
}

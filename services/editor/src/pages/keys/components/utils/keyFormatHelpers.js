import { createJPadSource } from '../../../../store/ducks/ducks-utils/blankKeyDefinition';

export const validKeyFormats = ['const', 'jpad'];
export const formatSuggestions = validKeyFormats.map(x => ({ label: x, value: x }));
export const isValidFormat = format => validKeyFormats.includes(format);

export const getManifestImplementationByFormat = (format) => {
  switch(format) {
  case 'const':
    return ({ type: 'const', format: undefined, value: '' });
  case 'jpad':
    return ({ type: 'file', format: 'jpad', value: undefined });
  default:
    console.error(`Invalid format ${format}`);
  }
};

export const getFormatValidations = (keyFormat) => {
  if (!keyFormat) {
    return { isValid: false, hint: 'Empty key format' };
  }

  const isValid = isValidFormat(keyFormat);
  const hint = !isValid ? `Invalid format ${keyFormat}` : undefined;
  return { isValid, hint };
};

export const createSourceByImplementation = (keyFormat, valueType) => {
  const source = keyFormat === 'const' ? null : createJPadSource(valueType);
  return source;
};

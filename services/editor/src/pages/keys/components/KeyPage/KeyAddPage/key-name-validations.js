import { BLANK_KEY_NAME } from '../../../../../store/ducks/ducks-utils/blankKeyDefinition';

const lengthValidation = {
  rule: ({ value }) => value.length > 0,
  hint: 'Empty key name',
};

const blankNameValidation = {
  rule: ({ value }) => !value.startsWith(BLANK_KEY_NAME),
  hint: 'Invalid key name',
};

const existingKeyValidation = {
  rule: ({ value, keysList }) => keysList.indexOf(value) < 0,
  hint: 'Key name already exists',
};

const keyAsFolderNameValidation = {
  rule: ({ value, keysList }) => !keysList.some((x) => x.startsWith(`${value}/`)),
  hint: 'Key name similar to existing category',
};

const keyFolderValidation = {
  rule: ({ value, keysList }) => !keysList.some((x) => value.startsWith(`${x}/`)),
  hint: 'Category similar to existing key',
};

const invalidCharactersValidation = {
  rule: ({ value }) => /(^(@?)[a-z0-9_]+)(\/(@?)([a-z0-9_])+)*$/.test(value),
  hint: 'Key name cannot include special characters',
};

const validations = [
  lengthValidation,
  blankNameValidation,
  existingKeyValidation,
  keyAsFolderNameValidation,
  keyFolderValidation,
  invalidCharactersValidation,
];

export default function keyNameValidations(keyName, keysList) {
  const failedRule = validations.find((x) => !x.rule({ value: keyName, keysList }));
  return { isValid: !failedRule, hint: failedRule && failedRule.hint };
}

import { BLANK_KEY_NAME } from '../../../../../store/ducks/ducks-utils/blankKeyDefinition';

type ValidationRequest = {
  value: string;
  keysList: string[];
};

type Validation = {
  rule: (request: ValidationRequest) => boolean;
  hint: string;
};

const lengthValidation: Validation = {
  rule: ({ value }) => !!value,
  hint: 'Empty key name',
};

const blankNameValidation: Validation = {
  rule: ({ value }) => !value.startsWith(BLANK_KEY_NAME),
  hint: 'Invalid key name',
};

const existingKeyValidation: Validation = {
  rule: ({ value, keysList }) => !keysList.includes(value),
  hint: 'Key name already exists',
};

const keyAsFolderNameValidation: Validation = {
  rule: ({ value, keysList }) => !keysList.some((x) => x.startsWith(`${value}/`)),
  hint: 'Key name similar to existing category',
};

const keyFolderValidation: Validation = {
  rule: ({ value, keysList }) => !keysList.some((x) => value.startsWith(`${x}/`)),
  hint: 'Category similar to existing key',
};

const invalidCharacters = /(^(@?)[a-z0-9_]+)(\/(@?)([a-z0-9_])+)*$/;
const invalidCharactersValidation: Validation = {
  rule: ({ value }) => invalidCharacters.test(value),
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

export type KeyNameValidationResult = {
  isValid: boolean;
  hint?: string;
  isShowingHint?: boolean;
};

export default function keyNameValidations(
  keyName: string,
  keysList: string[],
): KeyNameValidationResult {
  const failedRule = validations.find((x) => !x.rule({ value: keyName, keysList }));
  return { isValid: !failedRule, hint: failedRule?.hint };
}

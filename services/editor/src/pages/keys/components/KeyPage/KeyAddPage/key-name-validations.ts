import { useCallback } from 'react';
import { useKeysContext } from '../../../../../contexts/AllKeys';
import { BLANK_KEY_NAME } from '../../../../../contexts/SelectedKey/blankKeyDefinition';

type ValidationRequest = {
  value: string;
  keysList: string[];
};

type KeyNameValidation = {
  rule: (request: ValidationRequest) => boolean;
  hint: string;
};

const lengthValidation: KeyNameValidation = {
  rule: ({ value }) => !!value,
  hint: 'Empty key name',
};

const blankNameValidation: KeyNameValidation = {
  rule: ({ value }) => !value.startsWith(BLANK_KEY_NAME),
  hint: 'Invalid key name',
};

const existingKeyValidation: KeyNameValidation = {
  rule: ({ value, keysList }) => !keysList.includes(value),
  hint: 'Key name already exists',
};

const keyAsFolderNameValidation: KeyNameValidation = {
  rule: ({ value, keysList }) => !keysList.some((x) => x.startsWith(`${value}/`)),
  hint: 'Key name similar to existing category',
};

const keyFolderValidation: KeyNameValidation = {
  rule: ({ value, keysList }) => !keysList.some((x) => value.startsWith(`${x}/`)),
  hint: 'Category similar to existing key',
};

const invalidCharacters = /(^(@?)[a-z0-9_]+)(\/(@?)([a-z0-9_])+)*$/;
const invalidCharactersValidation: KeyNameValidation = {
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

export type Validation = {
  isValid: boolean;
  hint?: string;
  isShowingHint?: boolean;
};

export default function keyNameValidations(keyName: string, keysList: string[]): Validation {
  const failedRule = validations.find((x) => !x.rule({ value: keyName, keysList }));
  return { isValid: !failedRule, hint: failedRule?.hint };
}

export const useKeyPathValidation = () => {
  const keys$ = useKeysContext();

  return useCallback((keyPath: string) => keyNameValidations(keyPath, Object.keys(keys$.value)), [
    keys$,
  ]);
};

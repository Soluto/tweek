import { BLANK_KEY_NAME } from '../blankKeyDefinition';

const lengthValidation = {
  rule: ({value}) => value.length > 0,
  hint: 'Empty key name',
};

const blankNameValidation = {
  rule: ({value}) => {
    return !value.startsWith(BLANK_KEY_NAME);
  },
  hint: 'Invalid key name',
};

const existingKeyValidation = {
  rule: ({value, keysList}) => keysList.indexOf(value) < 0,
  hint: 'Key name already exists',
};

const keyAsFolderNameValidation = {
  rule: ({value, keysList}) => !keysList.some(x => x.startsWith(value + '/')) &&
    !keysList.some(x => x.indexOf('/' + value + '/') > -1),
  hint: 'Key name similar to existing category',
};

const invalidCharactersValidation = {
  rule: ({value}) => /(^[A-Za-z0-9@_]+)(\/([A-Za-z0-9@\_\s])+)*$/.test(value),
  hint: 'Key name cannot include special characters',
};

let keyNameValidations = [lengthValidation, blankNameValidation, existingKeyValidation, keyAsFolderNameValidation, invalidCharactersValidation];

export default function (keyName, keysList) {
  var failedRule = keyNameValidations.find(x => !x.rule({ value: keyName, keysList }));
  return { isValid: failedRule ? false : true, hint: failedRule ? failedRule.hint : undefined };
}
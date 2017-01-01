import { BLANK_KEY_NAME } from './blankKeyDefinition';

const lengthValidation = {
  rule: ({value}) => value.length > 0,
  hint: 'Empty key name'
};

const blankNameValidation = {
  rule: ({value}) => {
    return !value.startsWith(BLANK_KEY_NAME);
  },
  hint: 'Invalid key name'
};

const existingKeyValidation = {
  rule: ({value, keysList}) => keysList.indexOf(value) < 0,
  hint: 'Key name already exists'
};

const keyAsFolderNameValidation = {
  rule: ({value, keysList}) => !keysList.some(x => x.startsWith(value + '/')) &&
    !keysList.some(x => x.indexOf('/' + value + '/') > -1),
  hint: 'Key name similar to existing category'
};

let keyNameValidations = [lengthValidation, blankNameValidation, existingKeyValidation, keyAsFolderNameValidation];

export default function (keyName, keysList) {
  var failedRule = keyNameValidations.find(x => !x.rule({ value: keyName, keysList }));
  return { isValid: failedRule ? false : true, hint: failedRule ? failedRule.hint : undefined };
}
/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../../src/store/ducks/ducks-utils/validations/key-name-validations');
jest.unmock('chance');

import { assert, expect } from 'chai';
import keyNameValidations from '../../../../../src/store/ducks/ducks-utils/validations/key-name-validations';
import { BLANK_KEY_NAME } from '../../../../../src/store/ducks/ducks-utils/blankKeyDefinition';

describe('key-name-validations', () => {
  const categoryName1 = 'someCategoryName1';
  const categoryName2 = 'someCategoryName2';
  const keyName = 'someKeyName';

  const testDefenitions = [];
  const setTestDefenition = (expectedIsValid, keyName) =>
    testDefenitions.push({ keyName, expectedIsValid });

  setTestDefenition(false, BLANK_KEY_NAME);
  setTestDefenition(false, '');
  setTestDefenition(false, keyName);
  setTestDefenition(false, categoryName1);
  setTestDefenition(false, categoryName2);
  setTestDefenition(false, `${categoryName1}/${keyName}`);
  setTestDefenition(false, `${keyName}/other_key_name`);
  setTestDefenition(false, 'key!');
  setTestDefenition(false, 'key#');
  setTestDefenition(false, 'key%');
  setTestDefenition(false, 'key^');
  setTestDefenition(false, 'key&');
  setTestDefenition(false, 'key*');
  setTestDefenition(false, 'key(');
  setTestDefenition(false, 'key)');
  setTestDefenition(false, 'key-');
  setTestDefenition(false, 'key=');
  setTestDefenition(false, 'key+');
  setTestDefenition(false, 'key$');
  setTestDefenition(false, 'key$key');
  setTestDefenition(true, 'key');
  setTestDefenition(true, 'key/key_key');
  setTestDefenition(true, 'key_key');
  setTestDefenition(true, 'key_');
  setTestDefenition(false, 'key@');
  setTestDefenition(true, '@key');
  setTestDefenition(false, 'a');
  setTestDefenition(false, 'a/b');
  setTestDefenition(false, 'a/b/c');
  setTestDefenition(true, 'b');
  setTestDefenition(true, 'c');

  const existingKeyList = [
    'a/b/c',
    'aa',
    'bb',
    'aa/bb',
    keyName,
    `${categoryName1}/${keyName}`,
    `${categoryName1}/${categoryName2}/${keyName}`,
  ];

  testDefenitions.forEach((x) => {
    it(`should return validation ${x.expectedIsValid} for ${x.keyName}`, () => {
      // Act
      const validationResult = keyNameValidations(x.keyName, existingKeyList);

      // Assert
      expect(validationResult.isValid).to.equal(
        x.expectedIsValid,
        `should return value is ${x.expectedIsValid
          ? ''
          : 'in'}valid (hint: ${validationResult.hint})`,
      );
      if (!validationResult.isValid)
        assert(validationResult.hint.length > 0, 'should return an un empty hint');
    });
  });
});

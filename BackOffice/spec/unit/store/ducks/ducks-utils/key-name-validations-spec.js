/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../../modules/store/ducks/ducks-utils/key-name-validations');
jest.unmock('chance');

import keyNameValidations from '../../../../../modules/store/ducks/ducks-utils/key-name-validations';
import Chance from 'chance';
import { assert } from 'chai';
import { BLANK_KEY_NAME } from '../../../../../modules/store/ducks/ducks-utils/blankKeyDefinition';

describe('key-name-validations', () => {

  const chance = new Chance();
  const categoryName1 = 'someCategoryName1';
  const categoryName2 = 'someCategoryName2';
  const keyName = 'someKeyName';

  const invalidValues = [BLANK_KEY_NAME, '', keyName, categoryName1, categoryName2, categoryName1 + '/' + keyName];

  const mockKeysList = ['aa',
    'bb',
    'aa/bb',
    keyName,
    categoryName1 + '/' + keyName,
    categoryName1 + '/' + categoryName2 + '/' + keyName];

  invalidValues.forEach(invalidValue => {
    it('should return value is invalid for:' + invalidValue, () => {
      // Act
      const validationResult = keyNameValidations(invalidValue, mockKeysList);

      // Assert
      assert(!validationResult.isValid, 'should return value is invalid');
      assert(validationResult.hint.length > 0, 'should return an un empty hint');
    });
  });

  it('should return value is valid', () => {
    // Arrange
    const randomKeyName = chance.guid();

    // Act
    const validationResult = keyNameValidations(randomKeyName, mockKeysList);

    // Assert
    assert(validationResult.isValid, 'should return value is valid');
    assert(validationResult.hint === undefined, 'should return an undefined hint');
  });
});
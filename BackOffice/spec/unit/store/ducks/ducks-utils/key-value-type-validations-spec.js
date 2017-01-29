/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../../modules/store/ducks/ducks-utils/validations/key-value-type-validations');
jest.mock('../../../../../modules/services/TypesService', () => {
  return {
    types: {
      mockType1: { type: "mock-type1" },
      mockType2: { type: "mock-type1", typeAlias: "mock-type2" },
    },
  };
});

import { assert } from 'chai';
import keyValueTypeValidation from '../../../../../modules/store/ducks/ducks-utils/validations/key-value-type-validations';

describe('key-value-type-validations', () => {
  const testsDefenitions = [];
  const setTestDefenition = (keyValueType, expectedResult) =>
    testsDefenitions.push({
      keyValueType,
      expectedResult
    });

  setTestDefenition('', false);
  setTestDefenition(null, false);
  setTestDefenition(undefined, false);
  setTestDefenition('mock-type1', true);
  setTestDefenition('mock-type2', true);
  setTestDefenition('unexisting-mock-type', false);

  testsDefenitions.forEach(x => it('', () => {
    // Act
    const validationResult = keyValueTypeValidation(x.keyValueType);

    // Assert
    expect(validationResult.isValid).toEqual(x.expectedResult, 'validation result should be correct');
  }));
});
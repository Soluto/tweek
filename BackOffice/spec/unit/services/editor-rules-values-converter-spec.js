/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../modules/services/editor-rules-values-converter');
jest.mock('../../../modules/services/TypesService', () => {
  return {
    types: {
      string: { type: 'string' },
      number: { type: 'number' },
      bool: { type: 'boolean' },
    },
  };
});

import editorRulesValuesConverter from '../../../modules/services/editor-rules-values-converter';

describe('editor-rules-values-converter', () => {

  let testDefenitions = [];
  const setTestDefenition = (valueToConvert, fallbackValue, valueType, expectedValue, expectedSuccess) =>
    testDefenitions.push({ valueToConvert, fallbackValue, valueType, expectedValue, expectedSuccess });

  setTestDefenition('5', undefined, 'string', '5', true);
  setTestDefenition('pita', undefined, 'string', 'pita', true);
  setTestDefenition('5', undefined, 'number', 5, true);
  setTestDefenition('5a', 'aa', 'number', 'aa', false);
  setTestDefenition('true', undefined, 'boolean', true, true);
  setTestDefenition('false', undefined, 'boolean', false, true);
  setTestDefenition('5a', 'fallbackVal', 'unknown-type', 'fallbackVal', false);

  testDefenitions.forEach(x => it('should convert value correctly', () => {
    // Arrange

    // Act
    const convertResult =
      editorRulesValuesConverter(x.valueToConvert, x.fallbackValue, x.valueType);

    // Assert
    expect(convertResult.value).toEqual(x.expectedValue);
    expect(convertResult.isSucceeded).toEqual(x.expectedSuccess);
  }));
});
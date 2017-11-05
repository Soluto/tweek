/* global jest, before, beforeEach, describe, it, expect */
jest.unmock('../../../src/services/types-service');

import fetchMock from 'fetch-mock';
import * as TypesService from '../../../src/services/types-service';

describe('types-service', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  describe('refreshTypes', () => {
    it('should fetch api/types and save types with names', async () => {
      // Arrange
      fetchMock.get('*', {
        version: {
          base: 'string',
          comparer: 'version',
        },
      });

      // Act
      await TypesService.refreshTypes();

      // Assert
      expect(TypesService.types.version).toEqual({
        base: 'string',
        name: 'version',
        comparer: 'version',
      });
    });
  });

  describe('convertValue', () => {
    TypesService['version'] = {
      name: 'version',
      base: 'string',
    };

    let checkConvertedValueResult = function (value, type, expectedResult) {
      it('should convert values correctly', () => {
        expect(TypesService.convertValue(value, type)).toEqual(expectedResult);
      });
    };

    let shouldFailResult = function (value, type) {
      it('should convert values correctly', () => {
        expect(() => TypesService.convertValue(value, type)).toThrow();
      });
    };

    checkConvertedValueResult('5', 'string', '5');
    checkConvertedValueResult('5', 'number', 5);

    checkConvertedValueResult('true', 'string', 'true');
    checkConvertedValueResult('true', 'boolean', true);
    checkConvertedValueResult('false', 'boolean', false);

    checkConvertedValueResult('5', 'version', '5');

    shouldFailResult('5', 'boolean');
    shouldFailResult('5', 'unknownType');
    shouldFailResult('sheker', 'number');
  });
});

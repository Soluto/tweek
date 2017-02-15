/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../../modules/store/ducks/ducks-utils/validations/key-value-type-validations');
jest.mock('../../../../../modules/services/types-service', () => ({
  types: {
    string: { name: 'string' },
    boolean: { name: 'boolean' },
    number: { name: 'number' }
  }
}));

import { assert } from 'chai';
import keyValueTypeValidation from '../../../../../modules/store/ducks/ducks-utils/validations/key-value-type-validations';

describe('key-value-type-validations', () => {

  let checkTypeValidation = function (type, shouldBeValid) {
    it('should return ' + (shouldBeValid ? "valid" : "invalid") + " for type " + type, () => {
      expect(keyValueTypeValidation(type).isValid).toEqual(shouldBeValid);
    })
  };

  checkTypeValidation('', false);
  checkTypeValidation(null, false);
  checkTypeValidation(undefined, false);
  checkTypeValidation('string', true);
  checkTypeValidation('boolean', true);
  checkTypeValidation('number', true);
  checkTypeValidation('non-existent-type', false);
});
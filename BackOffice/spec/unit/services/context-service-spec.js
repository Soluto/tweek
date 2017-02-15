/* global jest, before, beforeEach, describe, it, expect */
jest.unmock('../../../modules/services/context-service');
jest.mock('../../../modules/services/types-service', () => {
  return {
    types: {
      string: { name: 'string' },
      version: { name: 'version', base: 'string' }
    },
  };
});

import fetchMock from 'fetch-mock';
import * as ContextService from '../../../modules/services/context-service';
import { assert, expect } from 'chai';

describe('context-service', () => {
  const contextServiceApiMatcher = 'glob:*/api/context-schema/*';

  afterEach(() => {
    fetchMock.restore();
  });

  describe('refreshSchema', () => {
    it('should fetch api/context-schema', async () => {
      // Arrange
      fetchMock.get(contextServiceApiMatcher, {});

      // Act
      await ContextService.refreshSchema();

      // Assert
      const apiCalls = fetchMock.calls(contextServiceApiMatcher);
      expect(apiCalls.length).to.equal(1, 'should fetch context-schema once');
    });
  });

  describe('getIdentities', () => {
    it('should return the returned schema identities', async () => {
      // Arrange
      const schema = {
        device: {
          someProp: {
            type: 'string'
          }
        }
      };

      const expectedIdentities = Object.keys(schema);

      fetchMock.get(contextServiceApiMatcher, schema);
      await ContextService.refreshSchema();

      // Act
      const actualIdentities = ContextService.getIdentities();

      // Assert
      expect(actualIdentities).to.deep.equal(expectedIdentities, 'should return correct identities');
    });
  });

  describe('getPropertyMeta', () => {
    let refreshSchemaPromise;

    const initializeSchema = {
      device: {
        Name: {
          type: 'string'
        },
        CustomPropertyType: {
          type: 'custom',
          custom_type: {
            base: 'string'
          }
        },
        PropertyWithBadType: {
          type: 'i dunno lol'
        }
      }
    };

    beforeAll(() => {
      fetchMock.get(contextServiceApiMatcher, initializeSchema);
      refreshSchemaPromise = ContextService.refreshSchema();
    });

    const runPropertyTypeTest = (property, expectedMeta) => {
      it('should return correct meta for property:' + property, async () => {
        // Arrange
        await refreshSchemaPromise;

        // Act
        const propertyTypeDetails = ContextService.getPropertyTypeDetails(property);

        // Assert
        expect(propertyTypeDetails).to.deep.equal(expectedMeta, 'should return correct property meta');
      });
    };

    runPropertyTypeTest(null, ({ name: 'empty' }));
    runPropertyTypeTest(undefined, ({ name: 'empty' }));
    runPropertyTypeTest('', ({ name: 'empty' }));
    runPropertyTypeTest('@@key.something', ({ name: 'string' }));

    runPropertyTypeTest('device.Name', ({ name: 'string' }));
    runPropertyTypeTest('device.CustomPropertyType', ({ name: 'custom', base: 'string' }));

    runPropertyTypeTest('device.UnknownProperty', ({ name: 'string' }));
    runPropertyTypeTest('device.PropertyWithBadType', ({ name: 'string' }));
  });
});
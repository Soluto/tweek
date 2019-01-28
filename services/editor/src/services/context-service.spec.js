/* eslint-disable import/first */
/* global jest, before, beforeEach, afterEach, describe, it, expect, require */
jest.mock('./types-service', () => ({
  types: {
    string: { name: 'string' },
    version: { name: 'version', base: 'string' },
  },
}));

import fetchMock from 'fetch-mock';
import chai, { assert, expect } from 'chai';
import * as ContextService from './context-service';

chai.use(require('chai-things'));

describe('context-service', () => {
  const contextServiceApiMatcher = 'glob:*/api/v2/schemas';

  afterEach(() => {
    fetchMock.restore();
  });

  describe('refreshSchema', () => {
    it('should fetch api/schemas', async () => {
      // Arrange
      fetchMock.get(contextServiceApiMatcher, {});

      // Act
      await ContextService.refreshSchema();

      // Assert
      const apiCalls = fetchMock.calls(contextServiceApiMatcher);
      expect(apiCalls.length).to.equal(1, 'should fetch schema once');
    });
  });

  describe('getIdentities', () => {
    it('should return the returned schema identities', async () => {
      // Arrange
      const schema = {
        device: {
          someProp: {
            type: 'string',
          },
        },
      };

      const expectedIdentities = Object.keys(schema);

      fetchMock.get(contextServiceApiMatcher, schema);
      await ContextService.refreshSchema();

      // Act
      const actualIdentities = ContextService.getIdentities();

      // Assert
      expect(actualIdentities).to.deep.equal(
        expectedIdentities,
        'should return correct identities',
      );
    });
  });

  describe('getSchemaProperties', () => {
    it('should return schema properties and @@id property', async () => {
      const schema = {
        user: {
          someProp: {
            type: 'string',
          },
        },
      };
      fetchMock.get(contextServiceApiMatcher, schema);
      await ContextService.refreshSchema();
      const result = ContextService.getSchemaProperties();
      expect(result.length).to.eql(2);
      expect(result).to.include.something.that.deep.equal({
        id: 'user.@@id',
        name: 'Id',
        type: 'string',
        identity: 'user',
      });
      expect(result).to.include.something.that.deep.equal({
        id: 'user.someProp',
        name: 'someProp',
        type: 'string',
        identity: 'user',
      });
    });
  });

  describe('getPropertyTypeDetails', () => {
    let refreshSchemaPromise;

    const initializeSchema = {
      device: {
        Name: {
          type: 'string',
        },
        CustomPropertyType: {
          type: {
            base: 'string',
          },
        },
        PropertyWithBadType: {
          type: 'i dunno lol',
        },
      },
    };

    beforeAll(() => {
      fetchMock.get(contextServiceApiMatcher, initializeSchema);
      refreshSchemaPromise = ContextService.refreshSchema();
    });

    const runPropertyTypeTest = (property, expectedMeta) => {
      it(`should return correct meta for property:${property}`, async () => {
        // Arrange
        await refreshSchemaPromise;

        // Act
        const propertyTypeDetails = ContextService.getPropertyTypeDetails(property);

        // Assert
        expect(propertyTypeDetails).to.deep.equal(
          expectedMeta,
          'should return correct property meta',
        );
      });
    };

    runPropertyTypeTest(null, { name: 'empty' });
    runPropertyTypeTest(undefined, { name: 'empty' });
    runPropertyTypeTest('', { name: 'empty' });
    runPropertyTypeTest('@@key.something', { name: 'string' });

    runPropertyTypeTest('device.Name', { name: 'string' });
    runPropertyTypeTest('device.CustomPropertyType', { base: 'string' });

    runPropertyTypeTest('device.UnknownProperty', { name: 'string' });
    runPropertyTypeTest('device.PropertyWithBadType', { name: 'string' });
  });
});

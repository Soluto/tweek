/* global jest, before, beforeEach, describe, it, expect */
jest.unmock('../../../modules/services/context-service');
jest.mock('../../../modules/services/types-service', () => {
  return {
    types: {
      testType1: { type: 'string', validate: 'someMeta' },
      testType2: { type: 'number' },
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
    const testDefenitions = [];

    const setTestDefenition = (property, expectedMeta) => {
      testDefenitions.push({ property, expectedMeta });
    };

    setTestDefenition(null, ({ type: 'empty' }));
    setTestDefenition(undefined, ({ type: 'empty' }));
    setTestDefenition('', ({ type: 'empty' }));
    setTestDefenition('@@key.something', ({ type: 'string' }));

    setTestDefenition('device.testProp1', ({ type: 'testType1', validate: 'someMeta' }));
    setTestDefenition('device.testProp2', ({ type: 'testType2' }));

    const initializeSchema = {
      device: {
        testProp1: {
          type: 'testType1'
        },
        testProp2: {
          type: 'testType2'
        }
      }
    };

    let refreshSchemaPromise;
    beforeAll(() => {
      fetchMock.get(contextServiceApiMatcher, initializeSchema);
      refreshSchemaPromise = ContextService.refreshSchema();
    });

    testDefenitions.forEach(x => {
      it('should return correct meta for property:' + x.property, async () => {
        // Arrange
        await refreshSchemaPromise;

        // Act
        const propertyMeta = ContextService.getPropertyMeta(x.property);
        
        // Assert
        expect(propertyMeta).to.deep.equal(x.expectedMeta, 'should return correct property meta');
      });
    });
  });
});
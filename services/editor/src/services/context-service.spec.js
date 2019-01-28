/* global jest, before, beforeAll, afterEach, describe, it, expect, require */
jest.mock('./types-service', () => ({
  types: {
    string: { name: 'string' },
    version: { name: 'version', base: 'string' },
  },
}));
jest.mock('../utils/tweekClients');

import { tweekManagementClient } from '../utils/tweekClients';
import * as ContextService from './context-service';

describe('context-service', () => {
  describe('refreshSchema', () => {
    it('should fetch api/schemas', async () => {
      // Act
      await ContextService.refreshSchema();

      // Assert
      expect(tweekManagementClient.getAllSchemas).toHaveBeenCalledTimes(1);
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

      tweekManagementClient.getAllSchemas.mockResolvedValue(schema);
      await ContextService.refreshSchema();

      // Act
      const actualIdentities = ContextService.getIdentities();

      // Assert
      expect(actualIdentities).toEqual(expectedIdentities);
    });
  });

  describe('getSchemaProperties', () => {
    it('should return schema properties and @@id property', async () => {
      // Arrange
      const schema = {
        user: {
          someProp: {
            type: 'string',
          },
        },
      };

      tweekManagementClient.getAllSchemas.mockResolvedValue(schema);
      await ContextService.refreshSchema();

      // Act
      const result = ContextService.getSchemaProperties();

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toContainEqual({
        id: 'user.@@id',
        name: 'Id',
        type: 'string',
        identity: 'user',
      });
      expect(result).toContainEqual({
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
      tweekManagementClient.getAllSchemas.mockResolvedValue(initializeSchema);
      refreshSchemaPromise = ContextService.refreshSchema();
    });

    const runPropertyTypeTest = (property, expectedMeta) => {
      it(`should return correct meta for property:${property}`, async () => {
        // Arrange
        await refreshSchemaPromise;

        // Act
        const propertyTypeDetails = ContextService.getPropertyTypeDetails(property);

        // Assert
        expect(propertyTypeDetails).toEqual(expectedMeta);
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

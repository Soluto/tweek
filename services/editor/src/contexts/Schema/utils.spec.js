import { getPropertyTypeDetails, getSchemaProperties } from './utils';

describe('schema utils', () => {
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

      // Act
      const result = getSchemaProperties(schema);

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

    const runPropertyTypeTest = (property, expectedMeta) => {
      it(`should return correct meta for property:${property}`, () => {
        // Act
        const propertyTypeDetails = getPropertyTypeDetails(property, initializeSchema);

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

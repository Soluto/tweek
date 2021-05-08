import { IdentityContext, Schema, ValueType } from 'tweek-client';
import * as TypesService from '../../services/types-service';

export const KEYS_IDENTITY = 'keys.';

export const FIXED_PREFIX = '@fixed:';

export type SchemaProperties = {
  id: string;
  name: string;
  type: string | ValueType;
  identity: string;
};

export const SYSTEM_PROPERTIES: SchemaProperties[] = [
  {
    id: 'system.time_utc',
    identity: 'system',
    name: 'time_utc',
    type: 'date',
  },
];

export const getSchemaProperties = (
  schemas: Record<string, Schema>,
  addSystem?: boolean,
): SchemaProperties[] => {
  const schemaProperties: SchemaProperties[] = Object.entries(schemas).flatMap(
    ([identity, schema]) => [
      { id: `${identity}.@@id`, name: 'Id', type: 'string', identity },
      ...Object.entries(schema).map(([property, { type }]) => ({
        id: `${identity}.${property}`,
        identity,
        name: property,
        type,
      })),
    ],
  );

  return addSystem ? [...schemaProperties, ...SYSTEM_PROPERTIES] : schemaProperties;
};

export const getPropertyTypeDetails = (
  property: string,
  schemas: Record<string, Schema>,
): ValueType => {
  if (!property) {
    return { name: 'empty' };
  }

  if (property.startsWith(KEYS_IDENTITY)) {
    return TypesService.types.string;
  }

  const propertyDetails = getSchemaProperties(schemas, true).find((x) => x.id === property);

  if (!propertyDetails) {
    console.warn('Property details not found', property);
    return TypesService.types.string;
  }

  const typeDetails =
    typeof propertyDetails.type === 'string'
      ? TypesService.types[propertyDetails.type]
      : propertyDetails.type;

  if (!typeDetails) {
    console.warn('Type details not found for type', propertyDetails.type, property);
    return TypesService.types.string;
  }

  return typeDetails;
};

export const getFixedKeys = (contextData: IdentityContext | null): IdentityContext =>
  contextData
    ? Object.fromEntries(
        Object.entries(contextData)
          .filter(([key]) => key.startsWith(FIXED_PREFIX))
          .map(([key, value]) => [key.substring(FIXED_PREFIX.length), value] as const),
      )
    : {};

export const getContextProperties = (
  contextData: IdentityContext | null,
  schema: Schema | undefined,
  excludeEmpty = false,
): IdentityContext => {
  const properties = Object.fromEntries(
    Object.entries(contextData || {}).filter(([key]) => !key.startsWith(FIXED_PREFIX)),
  );

  if (excludeEmpty || !schema) {
    return properties;
  }

  const identityScheme = Object.fromEntries(Object.keys(schema).map((key) => [key, '']));
  return { ...identityScheme, ...properties };
};

import { IdentityContext, Schemas, ValueType } from 'tweek-client';
import { tweekManagementClient } from '../utils';
import * as TypesService from './types-service';

export const KEYS_IDENTITY = 'keys.';

let contextSchema: Schemas = {};

export async function refreshSchema() {
  contextSchema = await tweekManagementClient.getAllSchemas();
}

export function getIdentities() {
  return Object.keys(contextSchema);
}

export function getSchema() {
  return contextSchema;
}

export type SchemaProperties = {
  id: string;
  name: string;
  type: string | ValueType;
  identity: string;
};

export function getSchemaProperties(): SchemaProperties[] {
  return Object.entries(contextSchema).flatMap(([identity, schema]) => [
    { id: `${identity}.@@id`, name: 'Id', type: 'string', identity },
    ...Object.entries(schema).map(([property, { type }]) => ({
      id: `${identity}.${property}`,
      identity,
      name: property,
      type,
    })),
  ]);
}

export function getSystemProperties(): SchemaProperties[] {
  return [{ id: 'system.time_utc', identity: 'system', name: 'time_utc', type: 'date' }];
}

export function getAllProperties() {
  return [...getSchemaProperties(), ...getSystemProperties()];
}

export function getPropertyTypeDetails(property: string) {
  if (!property) {
    return { name: 'empty' };
  }
  if (property.startsWith(KEYS_IDENTITY)) {
    return TypesService.types.string;
  }

  const propertyDetails = getAllProperties().find((x) => x.id === property);

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
}

export const FIXED_PREFIX = '@fixed:';

export function getFixedKeys(contextData: IdentityContext | null): IdentityContext {
  return contextData
    ? Object.fromEntries(
        Object.entries(contextData)
          .filter(([key]) => key.startsWith(FIXED_PREFIX))
          .map(([key, value]) => [key.substring(FIXED_PREFIX.length), value] as const),
      )
    : {};
}

export function getContextProperties(
  identity: string,
  contextData: IdentityContext | null,
  excludeEmpty = false,
): IdentityContext {
  const properties = Object.fromEntries(
    Object.entries(contextData || {}).filter(([key]) => !key.startsWith(FIXED_PREFIX)),
  );

  const schema = contextSchema[identity];

  if (excludeEmpty || !schema) {
    return properties;
  }

  const identityScheme = Object.fromEntries(Object.keys(schema).map((key) => [key, '']));
  return { ...identityScheme, ...properties };
}

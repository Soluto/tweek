/* global process */
import * as R from 'ramda';
import { tweekManagementClient } from '../utils/tweekClients';
import * as TypesService from './types-service';

export const KEYS_IDENTITY = 'keys.';

let contextSchema = {};

export async function refreshSchema() {
  contextSchema = await tweekManagementClient.getAllSchemas();
}

export function getIdentities() {
  return Object.keys(contextSchema);
}

export function getSchema() {
  return contextSchema;
}

export function getSchemaProperties() {
  return R.chain(
    (identity) => [
      { id: `${identity}.@@id`, name: 'Id', type: 'string', identity },
      ...Object.keys(contextSchema[identity]).map((property) => ({
        id: `${identity}.${property}`,
        identity,
        name: property,
        type: contextSchema[identity][property].type,
      })),
    ],
    Object.keys(contextSchema),
  );
}

export function getSystemProperties() {
  return [{ id: 'system.time_utc', identity: 'system', name: 'time_utc', type: 'date' }];
}

export function getAllProperties() {
  return [...getSchemaProperties(), ...getSystemProperties()];
}

export function getPropertyTypeDetails(property) {
  if (!property) return { name: 'empty' };
  if (property.startsWith(KEYS_IDENTITY)) return TypesService.types.string;

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

export function getFixedKeys(contextData = {}) {
  const fixedKeys = R.pickBy((_, prop) => prop.startsWith(FIXED_PREFIX), contextData);
  return Object.keys(fixedKeys).reduce(
    (result, key) => ({ ...result, [key.substring(FIXED_PREFIX.length)]: fixedKeys[key] }),
    {},
  );
}

export function getContextProperties(identity, contextData = {}, excludeEmpty = false) {
  const properties = R.pickBy((_, prop) => !prop.startsWith(FIXED_PREFIX), contextData);

  if (excludeEmpty) return properties;

  const identityScheme = R.map((_) => '', contextSchema[identity] || {});
  return { ...identityScheme, ...properties };
}

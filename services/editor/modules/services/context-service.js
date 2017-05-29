/* global fetch */
import R from 'ramda';
import * as TypesService from './types-service';

export const KEYS_IDENTITY = 'keys.';

let contextSchema = {};

export async function refreshSchema() {
  const response = await fetch('/api/context-schema/', { credentials: 'same-origin' });
  contextSchema = await response.json();
}

export function getIdentities() {
  return Object.keys(contextSchema);
}

export function getProperties() {
  return R.chain(
    identity => [
      { id: `${identity}.@@id`, name: 'Id', type: 'string', identity },
      ...Object.keys(contextSchema[identity]).map(property => ({
        id: `${identity}.${property}`,
        identity,
        name: property,
        type: contextSchema[identity][property].type,
        custom_type: contextSchema[identity][property].custom_type,
      })),
    ],
    Object.keys(contextSchema),
  );
}

export function getPropertyTypeDetails(property) {
  if (!property) return { name: 'empty' };
  if (property.startsWith(KEYS_IDENTITY)) return TypesService.types.string;

  const propertyDetails = getProperties().find(x => x.id === property);

  if (!propertyDetails) {
    console.warn('Property details not found', property);
    return TypesService.types.string;
  }

  if (propertyDetails.type === 'custom') {
    return Object.assign({}, { name: 'custom' }, propertyDetails.custom_type);
  }

  const typeDetails = TypesService.types[propertyDetails.type];

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

export function getContextProperties(identity, contextData = {}) {
  const identityScheme = R.map(_ => '', contextSchema[identity] || {});
  const properties = R.pickBy((_, prop) => !prop.startsWith(FIXED_PREFIX), contextData);

  return { ...identityScheme, ...properties };
}

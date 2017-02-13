import R from 'ramda';
import * as TypesService from './types-service';

let contextSchema = {};

export async function refreshSchema() {
  let response = await fetch("/api/context-schema/", { credentials: 'same-origin' });
  contextSchema = await response.json();
}

export function getIdentities() {
  return Object.keys(contextSchema);
}

export function getProperties() {
  return R.chain(identity => Object.keys(contextSchema[identity])
    .map(property => ({
      id: identity + "." + property,
      identity: identity,
      name: property,
      type: contextSchema[identity][property].type,
      custom_type: contextSchema[identity][property].custom_type
    })), Object.keys(contextSchema));
}

export function getPropertyTypeDetails(property) {
  if (!property) return { type: 'empty' };
  if (property.startsWith('@@key')) return TypesService.types.string;

  let propertyDetails = getProperties().find(x => x.id == property);

  if (!propertyDetails) {
    console.warn('Property details not found', property);
    return TypesService.types.string;
  }

  if (propertyDetails.type == "custom") {
    return Object.assign({}, {name: 'custom'}, propertyDetails.custom_type);
  }

  let typeDetails = TypesService.types[propertyDetails.type];

  if (!typeDetails) {
    console.warn("Type details not found for type", propertyDetails.type, property);
    return TypesService.types.string;
  }

  return typeDetails;
}
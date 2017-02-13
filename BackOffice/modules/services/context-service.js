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
      meta: getMetaForProperty(identity + "." + property)
    })), Object.keys(contextSchema));
}

export function getMetaForProperty(property) {
  console.log("property: ", property);
  let meta;
  if (!property) return { type: 'empty' };
  if (property.startsWith('@@key')) return { type: 'string' };

  const [identity, innerProperty] = property.split('.');

  let identityDetails = contextSchema[identity];
  if (!identityDetails) {
    console.warn('unsupported identity: ' + identity);
    return { type: 'string' };
  }
  meta = identityDetails[innerProperty];

  console.log("meta", meta);
  if (!meta) {
    console.warn('unsupported field meta: ' + property);
    return { type: 'string' };
  }

  if (meta.type == "custom") {
    console.log("custom_type", meta.custom_type);
    return meta.custom_type;
  }
  else {
    console.log("TypesService.types[meta.type]", TypesService.types[meta.type]);
    return TypesService.types[meta.type];
  }
}



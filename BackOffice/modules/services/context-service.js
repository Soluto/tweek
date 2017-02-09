import R from 'ramda';
import { types } from './TypesService';

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

  if (!meta) {
    console.warn('unsupported field meta: ' + property);
    return { type: 'string' };
  }

  const typeDefinition = Object.keys(types)
    .map(x => types[x])
    .find(x => x.typeAlias === meta.type || x.type === meta.type);

  if (!typeDefinition)
    return meta;

  let {type, typeAlias, ...props} = typeDefinition;

  return {
    ...meta,
    ...props,
  };
};



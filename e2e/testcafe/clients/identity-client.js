import assert from 'assert';
import * as R from 'ramda';
import { tweekManagementClient } from './tweek-clients';

const FIXED_KEY_PREFIX = '@fixed:';

const extractPropertiesFromContext = R.pickBy(
  (_, prop) => !prop.startsWith(FIXED_KEY_PREFIX) && prop !== '@CreationDate',
);

const extractOverrideKeysFromContext = (context) =>
  Object.entries(context)
    .filter(([key]) => key.startsWith(FIXED_KEY_PREFIX))
    .reduce(
      (acc, [key, value]) => ({ ...acc, [key.substring(FIXED_KEY_PREFIX.length)]: value }),
      {},
    );

export async function getFixedKeys(type, id) {
  const response = await tweekManagementClient.getContext(type, id);
  return extractOverrideKeysFromContext(response);
}

export function assertFixedKeysEqual(identityType, identityId, expected) {
  return async () => {
    const fixedKeys = await getFixedKeys(identityType, identityId);
    assert.deepStrictEqual(fixedKeys, expected);
  };
}

export async function getProperties(type, id) {
  const response = await tweekManagementClient.getContext(type, id);
  return extractPropertiesFromContext(response);
}

export function assertPropertiesEqual(identityType, identityId, expected) {
  return async () => {
    const properties = await getProperties(identityType, identityId);
    assert.deepStrictEqual(properties, expected);
  };
}

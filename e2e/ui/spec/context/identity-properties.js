/* global describe, before, after, it, browser */

import Identity from '../../utils/Identity';
import assert from 'assert';
import { login } from '../../utils/auth-utils';

describe('identity properties', () => {
  const identityId = 'awesome_user';
  const identityType = 'user';

  before(() => {
    login();
    browser.url('/context');
  });

  it('should modify identity properties', () => {
    const identity = Identity.open(identityType, identityId);
    const initialOverrideKeys = identity.overrideKeys;

    const expectedProperties = {
      FavoriteFruit: 'Tomato',
      Gender: 'male',
      IsInGroup: false,
    };

    Object.entries(expectedProperties).forEach(([key, value]) =>
      identity.updateProperty(key, value),
    );

    identity.commitChanges();

    assert.deepEqual(identity.overrideKeys, initialOverrideKeys);
    assert.deepEqual(identity.properties, expectedProperties);

    const editedProperties = {
      Gender: 'female',
      NumberOfSiblings: 5,
    };

    Object.entries(editedProperties).forEach(([key, value]) => identity.updateProperty(key, value));

    identity.commitChanges();

    assert.deepEqual(identity.overrideKeys, initialOverrideKeys);
    assert.deepEqual(identity.properties, { ...expectedProperties, ...editedProperties });
  });
});

/* global describe, before, after, it, browser */

import Identity from '../../utils/Identity';
import assert from 'assert';

describe('override keys', () => {
  const identityId = 'awesome_user';
  const identityType = 'user';
  const typedKey = 'behavior_tests/context/override_key';

  before(() => browser.url('/context').windowHandleSize({ width: 1360, height: 1020 }));

  it('should modify override keys', () => {
    const identity = Identity.open(identityType, identityId);
    const initialProperties = identity.properties;

    const overrideKeys = {
      'some/key': 'someValue',
      [typedKey]: 5,
    };

    for (const key in overrideKeys) {
      identity.addOverrideKey(key, overrideKeys[key]);
    }

    identity.commitChanges();

    assert.deepEqual(identity.overrideKeys, overrideKeys);

    const updatedKeys = {
      'some/key': 'newValue',
      'some/new/key': 'anotherValue',
    };

    identity
      .deleteOverrideKey(typedKey)
      .updateOverrideKey('some/key', 'newValue')
      .addOverrideKey('some/new/key', 'anotherValue')
      .commitChanges();

    assert.deepEqual(identity.overrideKeys, updatedKeys);

    Object.keys(updatedKeys).forEach(key => identity.deleteOverrideKey(key));
    identity.commitChanges();

    assert.deepEqual(identity.overrideKeys, {});
    assert.deepEqual(identity.properties, initialProperties);
  });
});

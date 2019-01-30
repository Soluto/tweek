import { editorUrl } from '../../utils/constants';
import { login, credentials } from '../../utils/auth-utils';
import { waitFor } from '../../utils/assertion-utils';
import { assertFixedKeysEqual, getProperties } from '../../clients/identity-client';
import ContextPage from '../../pages/Context';

const contextPage = new ContextPage();
const identityId = 'awesome_user';
const identityType = 'user';
const typedKey = 'behavior_tests/context/override_key';

fixture`Context Identity Properties`.page`${editorUrl}/context`
  .httpAuth(credentials)
  .beforeEach(login);

test('should modify override keys', async (t) => {
  const identity = await contextPage.open(identityType, identityId);
  const initialProperties = await getProperties(identityType, identityId);

  const overrideKeys = {
    'some/key': 'someValue',
    [typedKey]: 5,
  };

  for (const key in overrideKeys) {
    await identity.newFixedKey.add(key, overrideKeys[key]);
  }

  await identity.commitChanges();

  await waitFor(assertFixedKeysEqual(identityType, identityId, overrideKeys));

  const updatedKeys = {
    'some/key': 'newValue',
    'some/new/key': 'anotherValue',
  };

  await t.click(identity.fixedKey(typedKey).deleteButton);
  await identity.fixedKey('some/key').update('newValue');
  await identity.newFixedKey.add('some/new/key', 'anotherValue');
  await identity.commitChanges();

  await waitFor(assertFixedKeysEqual(identityType, identityId, updatedKeys));

  for (const key in updatedKeys) {
    await t.click(identity.fixedKey(key).deleteButton);
  }

  await identity.commitChanges();

  await waitFor(assertFixedKeysEqual(identityType, identityId, {}));
  await t.expect(await getProperties(identityType, identityId)).eql(initialProperties);
});

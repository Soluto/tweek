import IdentityPage from '../../pages/Identity';
import { editorUrl } from '../../utils/constants';
import { login, credentials } from '../../utils/auth-utils';
import { assertFixedKeysEqual, getProperties } from '../../clients/identity-client';
import { waitFor } from '../../utils/assertion-utils';

const identityPage = new IdentityPage();
const identityId = 'awesome_user';
const identityType = 'user';
const typedKey = 'behavior_tests/context/override_key';

fixture`Context Identity Properties`.page`${editorUrl}/context`
  .httpAuth(credentials)
  .beforeEach(login);

test('should modify override keys', async (t) => {
  await identityPage.open(identityType, identityId);
  const initialProperties = await getProperties(identityType, identityId);

  const overrideKeys = {
    'some/key': 'someValue',
    [typedKey]: 5,
  };

  for (const key in overrideKeys) {
    await identityPage.addFixedKey(key, overrideKeys[key]);
  }

  await identityPage.commitChanges();

  await waitFor(assertFixedKeysEqual(identityType, identityId, overrideKeys));

  const updatedKeys = {
    'some/key': 'newValue',
    'some/new/key': 'anotherValue',
  };

  await t.click(identityPage.fixedKeyDeleteButton(typedKey));
  await identityPage.updateFixedKey('some/key', 'newValue');
  await identityPage.addFixedKey('some/new/key', 'anotherValue');
  await identityPage.commitChanges();

  await waitFor(assertFixedKeysEqual(identityType, identityId, updatedKeys));

  for (const key in updatedKeys) {
    await t.click(identityPage.fixedKeyDeleteButton(key));
  }

  await identityPage.commitChanges();

  await waitFor(assertFixedKeysEqual(identityType, identityId, {}));
  await t.expect(await getProperties(identityType, identityId)).eql(initialProperties);
});

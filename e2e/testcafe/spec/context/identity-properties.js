import { credentials, login } from '../../utils/auth-utils';
import { editorUrl } from '../../utils/constants';
import { waitFor } from '../../utils/assertion-utils';
import { assertPropertiesEqual, getFixedKeys } from '../../clients/identity-client';
import ContextPage from '../../pages/Context';

const contextPage = new ContextPage();
const identityId = 'awesome_user';
const identityType = 'user';

fixture`Context Identity Properties`.page`${editorUrl}/context`
  .httpAuth(credentials)
  .beforeEach(login);

test('should modify identity properties', async (t) => {
  const identity = await contextPage.open(identityType, identityId);
  const initialOverrideKeys = await getFixedKeys(identityType, identityId);

  const expectedProperties = {
    FavoriteFruit: 'Tomato',
    Gender: 'male',
    IsInGroup: false,
  };

  for (const [property, value] of Object.entries(expectedProperties)) {
    await identity.property(property).update(value);
  }

  await identity.commitChanges();

  await waitFor(assertPropertiesEqual(identityType, identityId, expectedProperties));
  await t.expect(await getFixedKeys(identityType, identityId)).eql(initialOverrideKeys);

  const editedProperties = {
    Gender: 'female',
    NumberOfSiblings: 5,
  };

  for (const [property, value] of Object.entries(editedProperties)) {
    await identity.property(property).update(value);
  }

  await identity.commitChanges();

  await waitFor(
    assertPropertiesEqual(identityType, identityId, { ...expectedProperties, ...editedProperties }),
  );
  await t.expect(await getFixedKeys(identityType, identityId)).eql(initialOverrideKeys);
});

import { credentials, login } from '../../utils/auth-utils';
import { editorUrl } from '../../utils/constants';
import { getFixedKeys, getProperties } from '../../clients/identity-client';
import { tweekManagementClient } from '../../clients/tweek-clients';
import ContextPage from '../../pages/Context';

const contextPage = new ContextPage();
const identityId = 'identity_properties_user';
const identityType = 'user';

fixture`Context Identity Properties`.page`${editorUrl}/context`
  .httpAuth(credentials)
  .before(async () => {
    await tweekManagementClient.deleteContext(identityType, identityId);
  })
  .beforeEach(login);

test('should modify identity properties', async (t) => {
  const identity = await contextPage.open(identityType, identityId);

  const expectedProperties = {
    FavoriteFruit: 'Tomato',
    Gender: 'male',
    IsInGroup: false,
  };

  for (const [property, value] of Object.entries(expectedProperties)) {
    await identity.property(property).update(value);
  }

  await identity.commitChanges();

  await t
    .expect(await getProperties(identityType, identityId))
    .eql(expectedProperties)
    .expect(await getFixedKeys(identityType, identityId))
    .eql({});

  const editedProperties = {
    Gender: 'female',
    NumberOfSiblings: 5,
  };

  for (const [property, value] of Object.entries(editedProperties)) {
    await identity.property(property).update(value);
  }

  await identity.commitChanges();

  await t
    .expect(await getProperties(identityType, identityId))
    .eql({ ...expectedProperties, ...editedProperties })
    .expect(await getFixedKeys(identityType, identityId))
    .eql({});
});

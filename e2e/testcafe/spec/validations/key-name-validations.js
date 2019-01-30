import { editorUrl } from '../../utils/constants';
import { credentials, login } from '../../utils/auth-utils';
import { getLocation } from '../../utils/location-utils';
import KeysPage, { BLANK_KEY_NAME } from '../../pages/Keys';

const keysPage = new KeysPage();

fixture`Key Name Validations`.page`${editorUrl}/keys`.httpAuth(credentials).beforeEach(login);

test('name validations', async (t) => {
  const invalidKeyNames = [
    'key name',
    'keyname@',
    'keyName',
    '/keyname',
    'key@name/',
    'category/key@_name',
    '@keyName',
    '@category/@keyName',
    BLANK_KEY_NAME,
  ];
  const validKeyNames = [
    'key_name',
    'category/key_name',
    'category/key_name/key_name',
    '@key_name',
    '@category/@keyname',
  ];

  const newKey = await keysPage.addNewKey();

  for (const keyName of invalidKeyNames) {
    await t
      .typeText(newKey.nameInput, keyName, { replace: true })
      .expect(newKey.nameValidation.visible)
      .ok('should show validation icon for invalid key name');
  }

  for (const keyName of validKeyNames) {
    await t
      .typeText(newKey.nameInput, keyName, { replace: true })
      .expect(newKey.nameValidation.visible)
      .notOk('should not show validation icon for valid key name');
  }
});

test('should allow creating a key named "a/b/c" and also a key named "b"', async (t) => {
  const addEmptyKey = async (keyName) => {
    const newKey = await keysPage.addNewKey();
    await t.typeText(newKey.nameInput, keyName, { replace: true });

    const editKey = await newKey.continue();

    await editKey.commitChanges();
    await t.expect(getLocation()).eql(`${editorUrl}/keys/${keyName}`);
  };

  await addEmptyKey('a/b/c');

  await t.navigateTo('/keys');

  await addEmptyKey('b');
});

test('should show validation alert on clicking "Continue" without a value', async (t) => {
  const newKey = await keysPage.addNewKey();

  await t
    .click(newKey.continueButton)
    .expect(newKey.nameValidation.visible)
    .ok();
});

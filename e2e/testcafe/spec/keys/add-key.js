import { editorUrl } from '../../utils/constants';
import { credentials, login } from '../../utils/auth-utils';
import { getLocation } from '../../utils/location-utils';
import KeysPage, { BLANK_KEY_NAME } from '../../pages/Keys';

const keysPage = new KeysPage();

const keyToAddFullPath = `behavior_tests/add_key/add_key_test/${Date.now()}`;
const keyWithDefaultsToAddFullPath = `behavior_tests/add_key/dafault_format_and_type/${Date.now()}`;

fixture`Add Key`.page`${editorUrl}/keys`.httpAuth(credentials).beforeEach(login);

test('should succeed adding key', async (t) => {
  const newKey = await keysPage.addNewKey();

  await t.expect(getLocation()).eql(`${editorUrl}/keys/${BLANK_KEY_NAME}`);

  await t
    .typeText(newKey.nameInput, keyToAddFullPath, { replace: true })
    .typeText(newKey.valueTypeSelector, 'number', { replace: true })
    .typeText(newKey.formatSelector, 'const', { replace: true });

  const editKey = await newKey.continue();

  await t
    .expect(editKey.saveChangesButtonHasChanges.visible)
    .ok()
    .click(editKey.saveChangesButton);
  // .expect(editKey.saveChangesButtonIsSaving.visible).ok();

  await t
    .expect(getLocation())
    .eql(`${editorUrl}/keys/${keyToAddFullPath}`)
    .expect(editKey.archiveButton.visible)
    .ok()
    .expect(editKey.displayNameText.withExactText(keyToAddFullPath).exists)
    .ok()
    .expect(editKey.saveChangesButtonHasChanges.exists)
    .notOk();

  const link = await keysPage.navigateToLink(keyToAddFullPath);

  await t.expect(link.visible).ok();
});

test('should succeed adding key by entering key path only', async (t) => {
  const newKey = await keysPage.addNewKey();

  await t.expect(getLocation()).eql(`${editorUrl}/keys/${BLANK_KEY_NAME}`);

  await t.typeText(newKey.nameInput, keyWithDefaultsToAddFullPath, { replace: true });

  const editKey = await newKey.continue();

  await t
    .expect(editKey.saveChangesButtonHasChanges.visible)
    .ok()
    .click(editKey.saveChangesButton);
  // .expect(editKey.saveChangesButtonIsSaving.visible).ok();

  await t
    .expect(getLocation())
    .eql(`${editorUrl}/keys/${keyWithDefaultsToAddFullPath}`)
    .expect(editKey.archiveButton.visible)
    .ok()
    .expect(editKey.displayNameText.withExactText(keyWithDefaultsToAddFullPath).exists)
    .ok()
    .expect(editKey.saveChangesButtonHasChanges.exists)
    .notOk();

  const link = await keysPage.navigateToLink(keyWithDefaultsToAddFullPath);

  await t.expect(link.visible).ok();
});

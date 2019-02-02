import { t } from 'testcafe';
import { editorUrl } from '../../utils/constants';
import { credentials, login } from '../../utils/auth-utils';
import { getLocation } from '../../utils/location-utils';
import {
  archived,
  constManifest,
  createAlias,
  createConstKey,
  waitForKeyToBeDeleted,
} from '../../clients/authoring-client';
import { tweekManagementClient } from '../../clients/tweek-clients';
import KeysPage from '../../pages/Keys';
import EditKey from '../../pages/Keys/EditKey';
import Alert from '../../pages/Alert';

const archiveKeyPath = 'behavior_tests/delete_key/archive';
const deleteKeyPath = 'behavior_tests/delete_key/delete';
const deleteKeyAlias = 'behavior_tests/delete_key/delete_alias';

const keysPage = new KeysPage();
const alert = new Alert();

fixture`Delete Key`.page`${editorUrl}/keys`
  .httpAuth(credentials)
  .before(async () => {
    await createConstKey(archiveKeyPath, 'value');

    await tweekManagementClient.saveKeyDefinition(deleteKeyPath, {
      manifest: archived(constManifest(deleteKeyPath, 'value')),
    });
    await createAlias(deleteKeyPath, deleteKeyAlias);
  })
  .beforeEach(login);

const assertKeyDeleted = async (keyName) => {
  await waitForKeyToBeDeleted(keyName);

  const editKey = new EditKey();
  const link = await keysPage.navigateToLink(keyName);

  await t
    .expect(link.exists)
    .notOk()
    .navigateTo(`/keys/${keyName}`)
    .expect(keysPage.page.visible)
    .ok()
    .expect(editKey.container.exists)
    .notOk('key should not exist after delete');
};

test('archive key then unarchive', async (t) => {
  const editKey = await EditKey.open(archiveKeyPath);

  await t
    .expect(editKey.messageText.exist)
    .notOk()
    .expect(editKey.displayNameText.withExactText(archiveKeyPath).visible)
    .ok()
    .expect(editKey.archiveButton.visible)
    .ok()
    .expect(editKey.unarchiveButton.exists)
    .notOk()
    .expect(editKey.deleteButton.exists)
    .notOk();

  await editKey.commitChanges(editKey.archiveButton);

  await t
    .expect(editKey.messageText.visible)
    .ok()
    .expect(editKey.displayNameText.withExactText(`ARCHIVED: ${archiveKeyPath}`).visible)
    .ok()
    .expect(editKey.archiveButton.exists)
    .notOk()
    .expect(editKey.unarchiveButton.visible)
    .ok()
    .expect(editKey.deleteButton.visible)
    .ok();

  const link = await keysPage.navigateToLink(archiveKeyPath);

  await t.expect(link.exists).notOk();

  await editKey.commitChanges(editKey.unarchiveButton);

  await t
    .expect(editKey.messageText.exist)
    .notOk()
    .expect(editKey.displayNameText.withExactText(archiveKeyPath).visible)
    .ok()
    .expect(editKey.archiveButton.visible)
    .ok()
    .expect(editKey.unarchiveButton.exists)
    .notOk()
    .expect(editKey.deleteButton.exists)
    .notOk();

  await keysPage.navigateToLink(archiveKeyPath);

  await t.expect(link.visible).ok();
});

test('delete key flow', async (t) => {
  const editKey = await EditKey.open(deleteKeyPath);

  await t
    .click(editKey.deleteButton)
    .click(alert.cancelButton)
    .expect(getLocation())
    .eql(`${editorUrl}/keys/${deleteKeyPath}`);

  await EditKey.open(deleteKeyPath);

  await t
    .expect(editKey.container.visible)
    .ok()
    .click(editKey.deleteButton)
    .click(alert.cancelButton)
    .expect(getLocation())
    .eql(`${editorUrl}/keys/${deleteKeyPath}`);

  await EditKey.open(deleteKeyPath);

  await t
    .expect(editKey.container.visible)
    .ok()
    .click(editKey.deleteButton)
    .click(alert.okButton)
    .expect(getLocation())
    .eql(`${editorUrl}/keys`);

  await assertKeyDeleted(deleteKeyPath);
  await assertKeyDeleted(deleteKeyAlias);
});

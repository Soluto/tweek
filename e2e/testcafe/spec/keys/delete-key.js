import { t } from 'testcafe';
import { editorUrl } from '../../utils/constants';
import { credentials, login } from '../../utils/auth-utils';
import { waitFor } from '../../utils/assertion-utils';
import { getLocation } from '../../utils/location-utils';
import { tweekManagementClient } from '../../clients/tweek-clients';
import KeysPage from '../../pages/Keys';
import EditKey from '../../pages/Keys/EditKey';
import Alert from '../../pages/Alert';

const keysPage = new KeysPage();
const alert = new Alert();

fixture`Delete Key`.page`${editorUrl}/keys`.httpAuth(credentials).beforeEach(login);

const assertKeyDeleted = async (keyName) => {
  await waitFor(async () => {
    try {
      await tweekManagementClient.getKeyDefinition(keyName);
    } catch (e) {
      return;
    }
    throw new Error(`key '${keyName}' still exists`);
  });

  const editKey = new EditKey();
  const link = await keysPage.getKeyLink(keyName);

  await t
    .expect(link.exists)
    .notOk()
    .navigateTo(`/keys/${keyName}`)
    .expect(keysPage.page.visible)
    .ok()
    .expect(editKey.container.exists)
    .notOk('key should not exist after delete');
};

test('archive key', async (t) => {
  const keyName = 'behavior_tests/delete_key/archive';

  const editKey = await EditKey.open(keyName);

  await editKey.commitChanges(editKey.archiveButton);

  await t
    .expect(editKey.messageText.visible)
    .ok()
    .expect(editKey.displayNameText.withExactText(`ARCHIVED: ${keyName}`).visible)
    .ok()
    .expect(editKey.archiveButton.exists)
    .notOk()
    .expect(editKey.unarchiveButton.visible)
    .ok()
    .expect(editKey.deleteButton.visible)
    .ok();

  const link = await keysPage.getKeyLink(keyName);

  await t.expect(link.exists).notOk();
});

test('unarchive key', async (t) => {
  const keyName = 'behavior_tests/delete_key/unarchive';

  const editKey = await EditKey.open(keyName);

  await editKey.commitChanges(editKey.unarchiveButton);

  await t
    .expect(editKey.messageText.exist)
    .notOk()
    .expect(editKey.displayNameText.withExactText(keyName).visible)
    .ok()
    .expect(editKey.archiveButton.visible)
    .ok()
    .expect(editKey.unarchiveButton.exists)
    .notOk()
    .expect(editKey.deleteButton.exists)
    .notOk();

  const link = await keysPage.getKeyLink(keyName);

  await t.expect(link.visible).ok();
});

test('should not delete key if alert was not accepted', async (t) => {
  const keyName = 'behavior_tests/delete_key/delete/not_accepted';

  const editKey = await EditKey.open(keyName);

  await t
    .click(editKey.deleteButton)
    .click(alert.background, { offsetX: -200, offsetY: -200 })
    .expect(alert.background.exists)
    .notOk()
    .expect(getLocation())
    .eql(`${editorUrl}/keys/${keyName}`);

  await EditKey.open(keyName);

  await t.expect(editKey.container.visible).ok();
});

test('should not delete key if alert was canceled', async (t) => {
  const keyName = 'behavior_tests/delete_key/delete/canceled';

  const editKey = await EditKey.open(keyName);

  await t
    .click(editKey.deleteButton)
    .click(alert.cancelButton)
    .expect(getLocation())
    .eql(`${editorUrl}/keys/${keyName}`);

  await EditKey.open(keyName);

  await t.expect(editKey.container.visible).ok();
});

test('should succeed deleting key', async (t) => {
  const keyName = 'behavior_tests/delete_key/delete/accepted';
  const aliasKey = 'behavior_tests/delete_key/delete/alias';

  const editKey = await EditKey.open(keyName);

  await t
    .click(editKey.deleteButton)
    .click(alert.okButton)
    .expect(getLocation())
    .eql(`${editorUrl}/keys`);

  await assertKeyDeleted(keyName);
  await assertKeyDeleted(aliasKey);
});

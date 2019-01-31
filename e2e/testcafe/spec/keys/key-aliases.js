import { editorUrl } from '../../utils/constants';
import { credentials, login } from '../../utils/auth-utils';
import { getLocation } from '../../utils/location-utils';
import { dataField } from '../../utils/selector-utils';
import { waitForKeyToBeDeleted } from '../../clients/authoring-client';
import EditKey from '../../pages/Keys/EditKey';
import Alert from '../../pages/Alert';
import KeysPage from '../../pages/Keys';

const originalKeyPath = 'behavior_tests/key_aliases/regular_key';
const aliasKeyPath = 'behavior_tests/key_aliases/alias_key';
const aliasToAliasKeyPath = 'behavior_tests/key_aliases/alias_to_alias';
const newAliasKeyPath = 'behavior_tests/key_aliases/new_alias';
const deleteAliasKeyPath = 'behavior_tests/key_aliases/delete_alias';

const alert = new Alert();
const keysPage = new KeysPage();

fixture`Key Aliases`.page`${editorUrl}/keys`.httpAuth(credentials).beforeEach(login);

test('add alias', async (t) => {
  const editKey = await EditKey.open(originalKeyPath);

  await t
    .click(editKey.addAliasButton)
    .expect(alert.okButton.visible)
    .ok()
    .typeText(alert.section.find(dataField('new-key-name-input')), newAliasKeyPath, {
      replace: true,
    })
    .click(alert.okButton)
    .click(editKey.aliases.toggleButton)
    .expect(editKey.aliases.alias(newAliasKeyPath).container.visible)
    .ok();

  const link = await keysPage.navigateToLink(newAliasKeyPath);

  await t.expect(link.visible).ok();
});

test('should delete alias', async (t) => {
  const editKey = await EditKey.open(deleteAliasKeyPath); // should redirect to original key

  const alias = editKey.aliases.alias(deleteAliasKeyPath);

  await t
    .click(editKey.aliases.toggleButton)
    .expect(alias.container.visible)
    .ok()
    .click(alias.deleteButton)
    .click(alert.okButton)
    .expect(alias.container.exists)
    .notOk();

  const link = await keysPage.navigateToLink(deleteAliasKeyPath);

  await t.expect(link.exists).notOk();

  await waitForKeyToBeDeleted(deleteAliasKeyPath);
});

test('should redirect to key when navigating to alias', async (t) => {
  const editKey = await keysPage.openKey(aliasKeyPath);

  await t
    .expect(getLocation())
    .eql(`${editorUrl}/keys/${originalKeyPath}`)
    .click(editKey.aliases.toggleButton)
    .expect(editKey.aliases.alias(aliasKeyPath).container.visible)
    .ok()
    .expect(editKey.aliases.alias(aliasToAliasKeyPath).container.visible)
    .ok();
});

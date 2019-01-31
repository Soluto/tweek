import { t } from 'testcafe';
import { editorUrl } from '../../utils/constants';
import { credentials, login } from '../../utils/auth-utils';
import { refresh } from '../../utils/location-utils';
import KeysPage from '../../pages/Keys';

const keyName = 'behavior_tests/routing';
const keysPage = new KeysPage();

fixture`Navigating From Key With Changes`.page`${editorUrl}/keys`
  .httpAuth(credentials)
  .beforeEach(login);

test('should show confirm message if navigating to another key', async (t) => {
  const editKey = await openNewKey();

  await editKey.jpad.newRule.add();

  const link = await keysPage.navigateToLink(keyName);
  await t
    .expect(editKey.saveChangesButtonHasChanges.visible)
    .ok()
    .setNativeDialogHandler(() => true)
    .click(link);

  const history = await t.getNativeDialogHistory();

  await t
    .expect(history.length)
    .eql(1)
    .expect(history[0].type)
    .eql('confirm');
});

test('should show confirm message if refreshing', async (t) => {
  const editKey = await openNewKey();

  await editKey.jpad.newRule.add();

  await t
    .expect(editKey.saveChangesButtonHasChanges.visible)
    .ok()
    .setNativeDialogHandler(() => true);

  await refresh();

  const history = await t.getNativeDialogHistory();

  await t
    .expect(history.length)
    .eql(1)
    .expect(history[0].type)
    .eql('beforeunload');
});

const openNewKey = async () => {
  const newKey = await keysPage.addNewKey();
  await t
    .typeText(newKey.nameInput, 'routing_test', { replace: true })
    .typeText(newKey.valueTypeSelector, 'boolean', { replace: true });
  return await newKey.continue();
};

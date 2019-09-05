import { editorUrl } from '../../../utils/constants';
import { credentials, login } from '../../../utils/auth-utils';
import EditKey from '../../../pages/Keys/EditKey';
import Alert from '../../../pages/Alert';

const editKey = new EditKey();
const alert = new Alert();

fixture`Delete Partition`.page`${editorUrl}/keys/behavior_tests/partitions/delete_partition`
  .httpAuth(credentials)
  .beforeEach(async (t) => {
    await login(t);
    await t.expect(editKey.container.visible).ok();
  });

test('should clear rules after partition is deleted', async (t) => {
  await t.click(editKey.jpad.partitions.deleteButton.nth(0)).click(alert.okButton);

  await t.expect(await editKey.jpad.getSource(false)).eql({
    partitions: [],
    valueType: 'string',
    rules: [],
  });
});

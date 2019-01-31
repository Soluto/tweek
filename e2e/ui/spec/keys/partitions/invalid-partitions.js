import Alert from '../../../pages/Alert';
import { editorUrl } from '../../../utils/constants';
import { credentials, login } from '../../../utils/auth-utils';
import EditKey from '../../../pages/Keys/EditKey';

const editKey = new EditKey();
const alert = new Alert();

fixture`Invalid Partitions`.page`${editorUrl}/keys/behavior_tests/partitions/empty_partition`
  .httpAuth(credentials)
  .beforeEach(login);

test('should not allow invalid properties', async (t) => {
  await editKey.jpad.partitions.add('someInvalidValue');
  await t
    .expect(alert.okButton.visible)
    .ok()
    .expect(alert.cancelButton.exists)
    .notOk();
});

test('should not allow duplicate properties', async (t) => {
  await editKey.jpad.partitions.add('user.FavoriteFruit');

  await t.expect(alert.dialog.exists).notOk();

  await editKey.jpad.partitions.add('user.FavoriteFruit');

  await t
    .expect(alert.okButton.visible)
    .ok()
    .expect(alert.cancelButton.exists)
    .notOk();
});

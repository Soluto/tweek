import { editorUrl } from '../../utils/constants';
import { credentials, login } from '../../utils/auth-utils';
import EditKey from '../../pages/Keys/EditKey';

const testKeyFullPath = 'behavior_tests/read_only';

fixture`Readonly Key`.page`${editorUrl}/keys`.httpAuth(credentials).beforeEach(login);

test('should open the key as readonly', async (t) => {
  const editKey = await EditKey.open(testKeyFullPath);

  await t
    .expect(editKey.messageText.visible)
    .ok()
    .expect(editKey.jpad.container.find('fieldset').withAttribute('disabled').exists)
    .ok();
});

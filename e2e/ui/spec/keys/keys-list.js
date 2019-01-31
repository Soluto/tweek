import { editorUrl } from '../../utils/constants';
import { credentials, login } from '../../utils/auth-utils';
import { getLocation } from '../../utils/location-utils';
import KeysPage from '../../pages/Keys';

const keysListTestFolder = 'behavior_tests/keys_list';
const greenAppleKeyFullPath = `${keysListTestFolder}/green_apple`;
const redAppleKeyFullPath = `${keysListTestFolder}/red_apple`;
const bananaKeyFullPath = `${keysListTestFolder}/banana`;

const keysPage = new KeysPage();

fixture`Keys List And Filter`.page`${editorUrl}/keys`.httpAuth(credentials).beforeEach(login);

test('should be able to navigate to key by folders', async (t) => {
  await keysPage.openKey(greenAppleKeyFullPath);

  await t.expect(getLocation()).eql(`${editorUrl}/keys/${greenAppleKeyFullPath}`);
});

test('should display matching keys when filtering', async (t) => {
  await keysPage.search('apple');

  await t
    .expect(keysPage.link(greenAppleKeyFullPath).visible)
    .ok()
    .expect(keysPage.link(redAppleKeyFullPath).visible)
    .ok()
    .expect(keysPage.link(bananaKeyFullPath).exists)
    .notOk();
});

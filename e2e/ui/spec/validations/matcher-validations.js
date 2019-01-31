import { editorUrl } from '../../utils/constants';
import { credentials, login } from '../../utils/auth-utils';
import KeysPage from '../../pages/Keys';

const keysPage = new KeysPage();

fixture`Matcher Validations`.page`${editorUrl}/keys`.httpAuth(credentials).beforeEach(login);

const testCase = (property, isValid) => ({ property, isValid });
const testCases = [
  testCase('unknown.identity', false),
  testCase('not_a_property', false),
  testCase('user.FavoriteFruit', true),
  testCase('keys.some_key', true),
];

test('should show validation icon when identity is unknown', async (t) => {
  const newKey = await keysPage.addNewKey();
  await t.typeText(newKey.nameInput, 'matcher/validation', { replace: true });

  const editKey = await newKey.continue();
  const rule = await editKey.jpad.newRule.add();

  for (const { property, isValid } of testCases) {
    const condition = await rule.condition(property);

    if (isValid) {
      await t.expect(condition.validationIcon.exist).notOk('should not show validation icon');
    } else {
      await t.expect(condition.validationIcon.visible).ok('should show validation icon');
    }
  }
});

import { Selector } from 'testcafe';
import { editorUrl } from '../../utils/constants';
import { credentials, login } from '../../utils/auth-utils';
import EditKey from '../../pages/Keys/EditKey';

fixture`Dependent Keys`.page`${editorUrl}/keys`.httpAuth(credentials).beforeEach(login);

test('save when no circular dependencies', async (t) => {
  const editKey = await EditKey.open('behavior_tests/dependent_keys/pass/depends_on');
  const rule = await editKey.jpad.newRule.add();
  const condition = await rule.condition('keys.behavior_tests/dependent_keys/pass/used_by');
  await condition.setValue('value');

  await editKey.commitChanges();
});

test('should not save circular dependencies', async (t) => {
  const editKey = await EditKey.open('behavior_tests/dependent_keys/fail/third');
  const rule = await editKey.jpad.newRule.add();
  const condition = await rule.condition('keys.behavior_tests/dependent_keys/fail/first');
  await condition.setValue('value');

  await t
    .click(editKey.saveChangesButton)
    .expect(
      Selector('.notifications-br .notification-error .notification-title').withExactText(
        'Failed to save key',
      ).visible,
    )
    .ok();
});

test('display dependency relations between keys', async (t) => {
  const dependsOn = 'behavior_tests/dependent_keys/display/depends_on';
  const dependsOnAlias = 'behavior_tests/dependent_keys/display/depends_on_alias';
  const usedBy = 'behavior_tests/dependent_keys/display/used_by';

  const editKey = await EditKey.open(dependsOn);

  // Verify depends on
  await t
    .click(editKey.dependsOn.toggleButton)
    .expect(editKey.dependsOn.linkTo(usedBy).visible)
    .ok();

  // Verify used by
  await EditKey.open(usedBy);
  await t
    .click(editKey.usedBy.toggleButton)
    .expect(editKey.usedBy.linkTo(dependsOn).visible)
    .ok()
    .expect(editKey.usedBy.linkTo(dependsOnAlias).visible)
    .ok();
});

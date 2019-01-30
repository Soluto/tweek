import { expect } from 'chai';
import { editorUrl } from '../../utils/constants';
import { credentials, login } from '../../utils/auth-utils';
import { waitFor } from '../../utils/assertion-utils';
import { tweekManagementClient } from '../../clients/tweek-clients';
import EditKey from '../../pages/Keys/EditKey';
import Alert from '../../pages/Alert';

fixture`Edit JPad Key`.page`${editorUrl}/keys`.httpAuth(credentials).beforeEach(login);

const alert = new Alert();

test('should succeed editing JPad key', async (t) => {
  const keyName = 'behavior_tests/edit_key/visual/edit_test';
  const defaultValue = 'some default value';

  const editKey = await EditKey.open(keyName);

  await t.typeText(editKey.jpad.defaultValue.input, defaultValue, { replace: true });

  const firstRule = await editKey.jpad.newRule.add();

  await t
    .click(firstRule.newCondition.deleteButton)
    .typeText(firstRule.value, 'some value', { replace: true });

  await editKey.jpad.newRule.add();

  const setCondition = async (property, value) => {
    const condition = await firstRule.condition(property);
    await condition.setValue(value);
  };

  await setCondition('user.AgentVersion', '1.1.1');
  await setCondition('user.FavoriteFruit', 'Banana');
  await setCondition('user.BirthDate', '3d');
  await setCondition('user.IsInGroup', 'false');
  await setCondition('user.NumberOfSiblings', '1');
  await setCondition('user.SiblingNames', ['mark', 'temp']);
  await setCondition('user.Identities', [1, 'temp', 2]);
  await setCondition('unknown.identity', 'value');

  await t
    .expect(editKey.jpad.rulesCount)
    .eql(2)
    .click(editKey.jpad.sourceTab)
    .expect(editKey.jpad.sourceEditor.monaco.visible)
    .ok()
    .expect(editKey.jpad.sourceEditor.getSource())
    .eql(expectedKeySource);

  await editKey.commitChanges();

  await waitFor(async () => {
    const { implementation } = await tweekManagementClient.getKeyDefinition(keyName);
    expect(JSON.parse(implementation)).to.deep.equal(expectedKeySource);
  });
});

test('should succeed in editing an object JPad key', async (t) => {
  const keyName = 'behavior_tests/edit_key/visual/edit_object_test';
  const defaultValue = { value: 123 };
  const expectedObjectKeySource = {
    partitions: [],
    valueType: 'object',
    rules: [],
    defaultValue,
  };

  const editKey = await EditKey.open(keyName);
  const editor = await editKey.jpad.defaultValue.objectInput.editObject();
  await editor.setSource.with({ dependencies: { source: JSON.stringify(defaultValue) } })();

  await t
    .expect(editKey.jpad.defaultValue.objectInput.alert.saveButton.disabled)
    .notOk()
    .click(editKey.jpad.defaultValue.objectInput.alert.saveButton)
    .click(editKey.jpad.sourceTab)
    .expect(editKey.jpad.sourceEditor.monaco.visible)
    .ok()
    .expect(editKey.jpad.sourceEditor.getSource())
    .eql(expectedObjectKeySource);
});

test('should succeed in editing an array JPad key', async (t) => {
  const keyName = 'behavior_tests/edit_key/visual/edit_array_test';
  const defaultValue = ['val', 'test'];
  const expectedObjectKeySource = {
    partitions: [],
    valueType: 'array',
    rules: [],
    defaultValue,
  };

  const editKey = await EditKey.open(keyName);
  const editor = await editKey.jpad.defaultValue.objectInput.editObject();
  await editor.setSource.with({ dependencies: { source: JSON.stringify(defaultValue) } })();

  await t
    .expect(editKey.jpad.defaultValue.objectInput.alert.saveButton.disabled)
    .notOk()
    .click(editKey.jpad.defaultValue.objectInput.alert.saveButton)
    .click(editKey.jpad.sourceTab)
    .expect(editKey.jpad.sourceEditor.monaco.visible)
    .ok()
    .expect(editKey.jpad.sourceEditor.getSource())
    .eql(expectedObjectKeySource);
});

test('should succeed editing JPad source', async (t) => {
  const editKey = await EditKey.open('behavior_tests/edit_key/text/edit_test');

  await t
    .click(editKey.jpad.sourceTab)
    .expect(editKey.jpad.sourceEditor.monaco.visible)
    .ok();

  await editKey.jpad.sourceEditor.setSource.with({
    dependencies: { source: JSON.stringify(expectedKeySource, null, 4) },
  })();

  await t
    .click(editKey.jpad.rulesTab)
    .expect(editKey.jpad.rule().container.visible)
    .ok()
    .click(editKey.jpad.sourceTab)
    .expect(editKey.jpad.sourceEditor.monaco.visible)
    .ok()
    .expect(editKey.jpad.sourceEditor.getSource())
    .eql(expectedKeySource);

  await editKey.jpad.sourceEditor.setSource.with({ dependencies: { source: 'invalid json' } })();

  await t
    .click(editKey.jpad.rulesTab)
    .click(alert.okButton)
    .expect(editKey.jpad.rule().container.visible)
    .ok()
    .click(editKey.jpad.sourceTab)
    .expect(editKey.jpad.sourceEditor.monaco.visible)
    .ok()
    .expect(editKey.jpad.sourceEditor.getSource())
    .eql(expectedKeySource);
});

const expectedKeySource = {
  partitions: [],
  valueType: 'string',
  rules: [
    {
      Matcher: {
        'user.AgentVersion': '1.1.1',
        'user.FavoriteFruit': 'Banana',
        'user.BirthDate': {
          $withinTime: '3d',
          $compare: 'date',
        },
        'user.IsInGroup': false,
        'user.NumberOfSiblings': 1,
        'user.SiblingNames': {
          $contains: ['mark'],
        },
        'user.Identities': {
          $contains: [1, 2],
        },
        'unknown.identity': 'value',
      },
      Value: '',
      Type: 'SingleVariant',
    },
    {
      Matcher: {},
      Value: 'some value',
      Type: 'SingleVariant',
    },
  ],
  defaultValue: 'some default value',
};

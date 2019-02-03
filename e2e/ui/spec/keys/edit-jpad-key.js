import { expect } from 'chai';
import { editorUrl } from '../../utils/constants';
import { credentials, login } from '../../utils/auth-utils';
import { createEmptyJPadKey, waitForImplementation } from '../../clients/authoring-client';
import EditKey from '../../pages/Keys/EditKey';
import Alert from '../../pages/Alert';

const editJpadKeyPath = 'behavior_tests/edit_key/visual/edit_test';

fixture`Edit JPad Key`.page`${editorUrl}/keys`.httpAuth(credentials).beforeEach(login);

const alert = new Alert();

test('should succeed editing JPad key', async (t) => {
  const defaultValue = 'some default value';

  const editKey = await EditKey.open(editJpadKeyPath);

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

  await t.expect(editKey.jpad.rulesCount).eql(2);

  await t.expect(await editKey.jpad.getSource(true)).eql(expectedKeySource);

  await editKey.commitChanges();

  await waitForImplementation(editJpadKeyPath, expectedKeySource);
}).before(async (t) => {
  await createEmptyJPadKey(editJpadKeyPath);
  await login(t);
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
  await editor.setSource(JSON.stringify(defaultValue));

  await t
    .expect(editKey.jpad.defaultValue.objectInput.alert.saveButton.disabled)
    .notOk()
    .click(editKey.jpad.defaultValue.objectInput.alert.saveButton);

  await t.expect(await editKey.jpad.getSource(true)).eql(expectedObjectKeySource);
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
  await editor.setSource(JSON.stringify(defaultValue));

  await t
    .expect(editKey.jpad.defaultValue.objectInput.alert.saveButton.disabled)
    .notOk()
    .click(editKey.jpad.defaultValue.objectInput.alert.saveButton);

  await t.expect(await editKey.jpad.getSource(true)).eql(expectedObjectKeySource);
});

test('should succeed editing JPad source', async (t) => {
  const keyName = 'behavior_tests/edit_key/text/edit_test';

  const editKey = await EditKey.open(keyName);

  await editKey.jpad.setSource(JSON.stringify(expectedKeySource, null, 4));

  await t.expect(editKey.jpad.rule().container.visible).ok();

  await t.expect(await editKey.jpad.getSource(true)).eql(expectedKeySource);

  await editKey.jpad.setSource('invalid json');

  await t
    .click(alert.okButton)
    .expect(editKey.jpad.rule().container.visible)
    .ok();

  await t.expect(await editKey.jpad.getSource(true)).eql(expectedKeySource);
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

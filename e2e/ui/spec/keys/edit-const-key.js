import { Selector } from 'testcafe';
import { expect } from 'chai';
import { editorUrl } from '../../utils/constants';
import { credentials, login } from '../../utils/auth-utils';
import { attributeSelector } from '../../utils/selector-utils';
import { waitForValueToEqual } from '../../clients/api-client';
import { createConstKey } from '../../clients/authoring-client';
import EditKey from '../../pages/Keys/EditKey';

const constKeyFolder = 'behavior_tests/edit_key/visual/const';
const numberTypeKeyPath = `${constKeyFolder}/number_type`;
const stringTypeKeyPath = `${constKeyFolder}/string_type`;
const objectTypeKeyPath = `${constKeyFolder}/object_type`;
const dateTypeKeyPath = `${constKeyFolder}/date_type`;

fixture`Edit Const Key`.page`${editorUrl}/keys`.httpAuth(credentials).beforeEach(login);

test('should succeed editing key (valueType=number)', async (t) => {
  const editKey = await EditKey.open(numberTypeKeyPath);
  await t.typeText(editKey.constValue.input, '30', { replace: true });

  await editKey.commitChanges();

  await waitForValueToEqual(numberTypeKeyPath, 30);
}).before(async (t) => {
  await createConstKey(numberTypeKeyPath, 5);
  await login(t);
});

test('should succeed editing key (valueType=string)', async (t) => {
  const editKey = await EditKey.open(stringTypeKeyPath);
  await t.typeText(editKey.constValue.input, 'world', { replace: true });

  await editKey.commitChanges();

  await waitForValueToEqual(stringTypeKeyPath, 'world');
}).before(async (t) => {
  await createConstKey(stringTypeKeyPath, 'hello');
  await login(t);
});

test('should succeed editing key (valueType=object)', async (t) => {
  const objectValue = { boolProp: false };

  const editKey = await EditKey.open(objectTypeKeyPath);
  const editor = await editKey.constValue.objectInput.editObject();

  await editor.setSource(JSON.stringify(objectValue));

  await t
    .expect(editKey.constValue.objectInput.alert.saveButton.disabled)
    .notOk()
    .click(editKey.constValue.objectInput.alert.saveButton);

  await editKey.commitChanges();

  await waitForValueToEqual(objectTypeKeyPath, objectValue);
}).before(async (t) => {
  await createConstKey(objectTypeKeyPath, { boolProp: true });
  await login(t);
});

test('should succeed editing key (valueType=date)', async (t) => {
  const desiredDate = Selector(attributeSelector('datetime', '2018-10-11T00:00:00.000'));
  const desiredDateFormatted = '10/11/2018 00:00:00';

  const editKey = await EditKey.open(dateTypeKeyPath);

  await t
    .click(editKey.constValue.input)
    .expect(desiredDate.visible)
    .ok()
    .click(desiredDate);

  await editKey.commitChanges();

  await waitForValueToEqual(dateTypeKeyPath, desiredDateFormatted);
}).before(async (t) => {
  await createConstKey(dateTypeKeyPath, '10/10/2018 00:00:00', 'date');
  await login(t);
});

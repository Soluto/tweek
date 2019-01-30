import { Selector } from 'testcafe';
import { expect } from 'chai';
import { editorUrl } from '../../utils/constants';
import { credentials, login } from '../../utils/auth-utils';
import { waitFor } from '../../utils/assertion-utils';
import { attributeSelector } from '../../utils/selector-utils';
import { tweekClient } from '../../clients/tweek-clients';
import EditKey from '../../pages/Keys/EditKey';
import Alert from '../../pages/Alert';

const constKeyFolder = 'behavior_tests/edit_key/visual/const';
const alert = new Alert();

fixture`Edit Const Key`.page`${editorUrl}/keys`.httpAuth(credentials).beforeEach(login);

test('should succeed editing key (valueType=number)', async (t) => {
  const keyName = `${constKeyFolder}/number_type`;

  const editKey = await EditKey.open(keyName);
  await t.typeText(editKey.constValue.input, '30', { replace: true });

  await editKey.commitChanges();

  await waitFor(async () => {
    const result = await tweekClient.getValues(keyName);
    expect(result).to.equal(30);
  });
});

test('should succeed editing key (valueType=string)', async (t) => {
  const keyName = `${constKeyFolder}/string_type`;

  const editKey = await EditKey.open(keyName);
  await t.typeText(editKey.constValue.input, 'world', { replace: true });

  await editKey.commitChanges();

  await waitFor(async () => {
    const result = await tweekClient.getValues(keyName);
    expect(result).to.equal('world');
  });
});

test('should succeed editing key (valueType=object)', async (t) => {
  const keyName = `${constKeyFolder}/object_type`;
  const objectValue = { boolProp: false };

  const editKey = await EditKey.open(keyName);
  const editor = await editKey.constValue.editObject();

  await editor.setSource.with({ dependencies: { source: JSON.stringify(objectValue) } })();

  await t
    .expect(alert.saveButton.disabled)
    .notOk()
    .click(alert.saveButton);

  await editKey.commitChanges();

  await waitFor(async () => {
    const result = await tweekClient.getValues(keyName);
    expect(result).to.deep.equal(objectValue);
  });
});

test('should succeed editing key (valueType=date)', async (t) => {
  const desiredDate = Selector(attributeSelector('datetime', '2018-10-11T00:00:00.000'));
  const desiredDateFormatted = '10/11/2018 00:00:00';
  const keyName = `${constKeyFolder}/date_type`;

  const editKey = await EditKey.open(keyName);

  await t
    .click(editKey.constValue.input)
    .expect(desiredDate.visible)
    .ok()
    .click(desiredDate);

  await editKey.commitChanges();

  await waitFor(async () => {
    const result = await tweekClient.getValues(keyName);
    expect(result).to.equal(desiredDateFormatted);
  });
});

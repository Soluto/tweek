import { expect } from 'chai';
import { credentials, login } from '../../utils/auth-utils';
import { editorUrl } from '../../utils/constants';
import { getLocation } from '../../utils/location-utils';
import { tweekClient } from '../../clients/tweek-clients';
import { waitFor } from '../../utils/assertion-utils';
import SettingsPage from '../../pages/Settings';
import { Property } from '../../pages/Settings/Property';

const settingsPage = new SettingsPage();

fixture`Edit Identity`.page`${editorUrl}/settings`.httpAuth(credentials).beforeEach(login);

test('add new identity with simple property and then delete', async (t) => {
  const currentIdentity = await settingsPage.add('Device');
  await t.expect(getLocation()).eql(`${editorUrl}/settings/identities/device`);

  await currentIdentity.newProperty.add('Model');
  await t.click(currentIdentity.saveButton);

  await waitFor(async () => {
    const result = await tweekClient.getValues('@tweek/schema/device');
    expect(result).to.deep.equal({ Model: { type: 'string' } });
  });

  await t.click(currentIdentity.deleteButton);

  await waitFor(async () => {
    const result = await tweekClient.getValues('@tweek/schema/_');
    expect(result).to.not.have.property('device');
  });
});

test('add simple property and save', async (t) => {
  const currentIdentity = await settingsPage.open('edit_properties_test');
  await currentIdentity.newProperty.add('Age', 'number');
  await t.click(currentIdentity.saveButton);

  await waitFor(async () => {
    const result = await tweekClient.getValues('@tweek/schema/edit_properties_test');
    expect(result)
      .to.have.property('Age')
      .that.deep.include({ type: 'number' });
  });
});

test('add and update custom property', async (t) => {
  const currentIdentity = await settingsPage.open('edit_properties_test');
  const osTypeProperty = await currentIdentity.newProperty.add('OsType', 'string', true);
  await t.click(currentIdentity.saveButton);

  await waitFor(async () => {
    const result = await tweekClient.getValues('@tweek/schema/edit_properties_test');
    expect(result)
      .to.have.property('OsType')
      .that.deep.include({ type: { base: 'string', allowedValues: [] } });
  });

  await osTypeProperty.addAllowedValues(['Android', 'iOS']);
  await t.click(currentIdentity.saveButton);

  await waitFor(async () => {
    const result = await tweekClient.getValues('@tweek/schema/edit_properties_test');
    expect(result)
      .to.have.property('OsType')
      .that.deep.include({ type: { base: 'string', allowedValues: ['Android', 'iOS'] } });
  });
});

test('delete property and save', async (t) => {
  const currentIdentity = await settingsPage.open('delete_property_test');
  await t.click(currentIdentity.property('Group').deleteButton);
  await t.click(currentIdentity.saveButton);

  await waitFor(async () => {
    const result = await tweekClient.getValues('@tweek/schema/delete_property_test');
    expect(result).to.deep.equal({});
  });
});

import { expect } from 'chai';
import { credentials, login } from '../../utils/auth-utils';
import { editorUrl } from '../../utils/constants';
import { getLocation } from '../../utils/location-utils';
import { waitFor } from '../../utils/assertion-utils';
import { createConstKey, waitForKeyToBeDeleted } from '../../clients/authoring-client';
import { waitForValueToEqual } from '../../clients/api-client';
import { tweekClient } from '../../clients/tweek-clients';
import SettingsPage from '../../pages/Settings';

const settingsPage = new SettingsPage();

fixture`Edit Identity`.page`${editorUrl}/settings`
  .httpAuth(credentials)
  .before(async () => {
    await createConstKey('@tweek/schema/edit_properties_test', {});
    await createConstKey('@tweek/schema/delete_property_test', {
      Group: {
        type: 'string',
      },
    });
  })
  .beforeEach(login);

test('add new identity with simple property and then delete', async (t) => {
  const currentIdentity = await settingsPage.add('Device');
  await t.expect(getLocation()).eql(`${editorUrl}/settings/identities/device`);

  await currentIdentity.newProperty.add('Model');
  await t.click(currentIdentity.saveButton);

  await waitForValueToEqual('@tweek/schema/device', { Model: { type: 'string' } });

  await t.click(currentIdentity.deleteButton);

  await waitForKeyToBeDeleted('@tweek/schema/device');
});

test('add property and save', async (t) => {
  const currentIdentity = await settingsPage.open('edit_properties_test');
  await currentIdentity.newProperty.add('Age', 'number');
  await t.click(currentIdentity.saveButton);

  await waitFor(async () => {
    const result = await tweekClient.getValues('@tweek/schema/edit_properties_test');
    expect(result).to.deep.equal({ Age: { type: 'number' } });
  });

  const osTypeProperty = await currentIdentity.newProperty.add('OsType', 'string', true);
  await t.click(currentIdentity.saveButton);

  await waitFor(async () => {
    const result = await tweekClient.getValues('@tweek/schema/edit_properties_test');
    expect(result).to.deep.equal({
      Age: { type: 'number' },
      OsType: { type: { base: 'string', allowedValues: [] } },
    });
  });

  await osTypeProperty.addAllowedValues(['Android', 'iOS']);
  await t.click(currentIdentity.saveButton);

  await waitFor(async () => {
    const result = await tweekClient.getValues('@tweek/schema/edit_properties_test');
    expect(result).to.deep.equal({
      Age: { type: 'number' },
      OsType: { type: { base: 'string', allowedValues: ['Android', 'iOS'] } },
    });
  });
});

test('delete property and save', async (t) => {
  const currentIdentity = await settingsPage.open('delete_property_test');
  await t.click(currentIdentity.property('Group').deleteButton);
  await t.click(currentIdentity.saveButton);

  await waitForValueToEqual('@tweek/schema/delete_property_test', {});
});

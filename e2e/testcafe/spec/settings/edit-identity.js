import { Selector } from 'testcafe';
import { expect } from 'chai';
import { attributeSelector, dataComp, dataField } from '../../utils/selector-utils';
import { credentials, login } from '../../utils/auth-utils';
import { editorUrl } from '../../utils/constants';
import { getLocation } from '../../utils/location-utils';
import { tweekClient } from '../../clients/tweek-clients';
import { waitFor } from '../../utils/assertion-utils';

const dataLabel = attributeSelector('data-label');
const propertyItem = (propertyName) =>
  dataComp('property-item') + attributeSelector('data-property-name', propertyName);
const newPropertyItem = dataComp('new-property-item');
const newPropertyName = `${newPropertyItem} ${dataField('property-name')}`;

const addStringProperty = async (t, propertyName) =>
  await t.typeText(newPropertyName, propertyName).pressKey('enter');

const addTypedProperty = async (t, propertyName, propertyType, advanced) => {
  const propertyTypeSelector = `${newPropertyItem} ${dataComp('type-select')}`;
  const suggestion = `${newPropertyItem} ${dataLabel(propertyType)} a`;
  const addButton = `${newPropertyItem} ${dataComp('add')}`;
  const advancedButton = `${newPropertyItem} ${dataComp('advanced')}`;

  await t
    .typeText(newPropertyName, propertyName)
    .click(propertyTypeSelector)
    .click(suggestion);

  if (advanced) {
    await t.click(advancedButton);
  }

  await t
    .click(addButton)
    .expect(Selector(propertyItem(propertyName)).visible)
    .ok();
};

const deleteProperty = async (t, propertyName) => {
  const deleteButton = `${propertyItem(propertyName)} ${dataComp('remove')}`;
  await t.click(deleteButton);
};

const updateExistingCustomProperty = async (t, propertyName, { base, allowedValues } = {}) => {
  const propertyType = `${propertyItem(propertyName)} ${dataField('property-type')}`;
  if (base) {
    const baseSelector = (selector) => `${propertyType} ${dataField('base')} ${selector}`;
    const baseType = baseSelector(dataComp('type-select'));
    const suggestion = baseSelector(`${dataLabel(base)} a`);

    await t.click(baseType).click(suggestion);
  }
  if (allowedValues) {
    const allowedValuesInput = `${propertyType} ${dataField('allowed-values')} input`;
    await allowedValues.reduce(async (p, allowedValue) => {
      await p;
      await t.typeText(allowedValuesInput, allowedValue).pressKey('enter');
    }, Promise.resolve());
  }
};

const addNewIdentity = async (t, identityType) => {
  const addNewIdentityComp = (selector) => `${dataComp('add-new-identity')} ${selector}`;

  await t
    .navigateTo('/settings')
    .expect(Selector('.side-menu').visible)
    .ok()
    .click(addNewIdentityComp('button'))
    .typeText(addNewIdentityComp('input'), identityType)
    .pressKey('enter');
};

const saveChanges = async (t) => await t.click(dataComp('save-button'));

const deleteCurrentIdentity = async (t) => await t.click(dataComp('delete-identity'));

const goToIdentityPage = async (t, identityType) => {
  await t
    .navigateTo(`/settings/identities/${identityType}`)
    .expect(Selector('.identity-page').visible)
    .ok();
};

fixture`Edit Identity`.page`${editorUrl}`.httpAuth(credentials).beforeEach(login);

test('add new identity with simple property and then delete', async (t) => {
  await addNewIdentity(t, 'Device');
  await t.expect(getLocation()).eql(`${editorUrl}/settings/identities/device`);

  await addStringProperty(t, 'Model');
  await saveChanges(t);

  await waitFor(async () => {
    const result = await tweekClient.getValues('@tweek/schema/device');
    expect(result).to.deep.equal({ Model: { type: 'string' } });
  });

  await deleteCurrentIdentity(t);

  await waitFor(async () => {
    const result = await tweekClient.getValues('@tweek/schema/_');
    expect(result).to.not.have.property('device');
  });
});

test('add simple property and save', async (t) => {
  await goToIdentityPage(t, 'edit_properties_test');
  await addTypedProperty(t, 'Age', 'number');
  await saveChanges(t);

  await waitFor(async () => {
    const result = await tweekClient.getValues('@tweek/schema/edit_properties_test');
    expect(result)
      .to.have.property('Age')
      .that.deep.include({ type: 'number' });
  });
});

test('add and update custom property', async (t) => {
  await goToIdentityPage(t, 'edit_properties_test');
  await addTypedProperty(t, 'OsType', 'string', true);
  await saveChanges(t);

  await waitFor(async () => {
    const result = await tweekClient.getValues('@tweek/schema/edit_properties_test');
    expect(result)
      .to.have.property('OsType')
      .that.deep.include({ type: { base: 'string', allowedValues: [] } });
  });

  await updateExistingCustomProperty(t, 'OsType', { allowedValues: ['Android', 'iOS'] });
  await saveChanges(t);

  await waitFor(async () => {
    const result = await tweekClient.getValues('@tweek/schema/edit_properties_test');
    expect(result)
      .to.have.property('OsType')
      .that.deep.include({ type: { base: 'string', allowedValues: ['Android', 'iOS'] } });
  });
});

test('delete property and save', async (t) => {
  await goToIdentityPage(t, 'delete_property_test');
  await deleteProperty(t, 'Group');
  await saveChanges(t);

  await waitFor(async () => {
    const result = await tweekClient.getValues('@tweek/schema/delete_property_test');
    expect(result).to.deep.equal({});
  });
});

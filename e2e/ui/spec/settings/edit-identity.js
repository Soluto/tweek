/* global describe, before, after, it, browser */
import { expect } from 'chai';
import tweekApiClient from '../../clients/tweek-api-client';
import { attributeSelector, dataComp, dataField } from '../../utils/selector-utils';
import { login } from '../../utils/auth-utils';

const dataLabel = attributeSelector('data-label');
const propertyItem = propertyName =>
  dataComp('property-item') + attributeSelector('data-property-name', propertyName);
const newPropertyItem = dataComp('new-property-item');
const newPropertyName = `${newPropertyItem} ${dataField('property-name')}`;

const addStringProperty = propertyName => {
  $(newPropertyName).setValue(`${propertyName}\n`);
};

const addTypedProperty = (propertyName, propertyType) => {
  $(newPropertyName).setValue(propertyName);

  const propertyTypeSelector = `${newPropertyItem} ${dataComp('type-select')}`;
  const suggestion = `${newPropertyItem} ${dataLabel(propertyType)} a`;
  const addButton = `${newPropertyItem} ${dataComp('add')}`;

  $(propertyTypeSelector).click();
  $(suggestion).click();
  $(addButton).click();

  browser.waitForVisible(propertyItem(propertyName));
};

const deleteProperty = propertyName => {
  const deleteButton = `${propertyItem(propertyName)} ${dataComp('remove')}`;
  $(deleteButton).click();
};

const updateExistingCustomProperty = (propertyName, { base, allowedValues } = {}) => {
  const propertyType = `${propertyItem(propertyName)} ${dataField('property-type')}`;
  if (base) {
    const baseSelector = selector => `${propertyType} ${dataField('base')} ${selector}`;
    const baseType = baseSelector(dataComp('type-select'));
    const suggestion = baseSelector(`${dataLabel(base)} a`);

    $(baseType).click();
    $(suggestion).click();
  }
  if (allowedValues) {
    const allowedValuesInput = `${propertyType} ${dataField('allowed-values')} input`;
    $(allowedValuesInput).setValue(`${allowedValues.join('\n')}\n`);
  }
};

const addNewIdentity = identityType => {
  const addNewIdentityComp = selector => `${dataComp('add-new-identity')} ${selector}`;

  browser.url(`/settings`);
  browser.waitForVisible('.side-menu');
  $(addNewIdentityComp('button')).click();
  $(addNewIdentityComp('input')).setValue(`${identityType}\n`);
};

const saveChanges = () => {
  $(dataComp('save-button')).click();
};

const deleteCurrentIdentity = () => {
  $(dataComp('delete-identity')).click();
};

const goToIdentityPage = identityType => {
  browser.url(`/settings/identities/${identityType}`);
  browser.waitForVisible('.identity-page');
};

describe('edit identity schema', () => {
  before(() => login());

  it('add new identity with simple property and then delete', () => {
    addNewIdentity('Device');
    expect(browser.getUrl()).to.endsWith('settings/identities/device');
    addStringProperty('Model');
    saveChanges();
    tweekApiClient.waitForKeyToEqual('@tweek/schema/device', { Model: { type: 'string' } });
    deleteCurrentIdentity();
    tweekApiClient.eventuallyExpectKey('@tweek/schema/_', result =>
      expect(result).to.not.have.property('device'),
    );
  });

  describe('editing existing identity', () => {
    it('add simple property and save', () => {
      goToIdentityPage('edit_properties_test');
      addTypedProperty('Age', 'number');
      saveChanges();
      tweekApiClient.eventuallyExpectKey('@tweek/schema/edit_properties_test', result =>
        expect(result)
          .to.have.property('Age')
          .that.deep.include({ type: 'number' }),
      );
    });

    it('add and update custom property', () => {
      goToIdentityPage('edit_properties_test');
      addTypedProperty('OsType', 'string');
      saveChanges();
      tweekApiClient.eventuallyExpectKey('@tweek/schema/edit_properties_test', result => {
        expect(result)
          .to.have.property('OsType')
          .that.deep.include({ type: { base: 'string', allowedValues: [] } });
      });
      updateExistingCustomProperty('OsType', { allowedValues: ['Android', 'iOS'] });
      saveChanges();
      tweekApiClient.eventuallyExpectKey('@tweek/schema/edit_properties_test', result => {
        expect(result)
          .to.have.property('OsType')
          .that.deep.include({ type: { base: 'string', allowedValues: ['Android', 'iOS'] } });
      });
    });

    it('delete property and save', () => {
      goToIdentityPage('delete_property_test');
      deleteProperty('Group');
      saveChanges();
      tweekApiClient.waitForKeyToEqual('@tweek/schema/delete_property_test', {});
    });
  });
});

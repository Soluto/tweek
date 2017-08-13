/* global describe, before, after, it, browser */
import { expect } from 'chai';
import tweekApiClient from '../../utils/tweekApiClient';

function addStringProperty(propertyName) {
  browser.setValue(
    '*[data-comp=new-property-item] > input[type=text]:first-child',
    `${propertyName}\n`,
  );
}

function addTypedProperty(propertyName, propertyType) {
  browser.setValue('[data-comp=new-property-item] > input[type=text]:first-child', propertyName);
  browser.click('[data-comp=new-property-item] [data-comp=ComboBox] input');
  browser.click(`[data-comp=new-property-item] [data-label=${propertyType}] a`);
  browser.click('[data-comp=new-property-item] button[data-comp=add]');
  browser.waitForVisible(`[data-comp= property-item][data-property-name= ${propertyName}]`);
}

function deleteProperty(propertyName) {
  browser.click(
    `*[data-comp=property-item][data-property-name=${propertyName}] button[data-comp=remove]`,
  );
}

function updateExistingCustomProperty(propertyName, { base, allowedValues } = {}) {
  let baseSelector = `*[data-comp=property-item][data-property-name=${propertyName}] *[data-field=property-type]`;
  if (base) {
    browser.click(`${baseSelector} *[data-field=base] *[data-comp=ComboBox] input`);
    browser.click(`${baseSelector} *[data-field=base] *[data-label=${base}] a`);
  }
  if (allowedValues) {
    browser.setValue(
      `${baseSelector} *[data-field=allowed-values] input`,
      allowedValues.join('\n') + '\n',
    );
  }
}

function addNewIdentity(identityType) {
  browser.url(`/settings`);
  browser.waitForVisible('.side-menu');
  browser.click('*[data-comp=AddNewIdentity] button');
  browser.setValue('*[data-comp=AddNewIdentity] input', `${identityType}\n`);
}

function saveChanges() {
  browser.click('*[data-comp=save-button]');
}

function deleteCurrentIdentity() {
  browser.click('*[data-comp=delete-identity]');
}

function goToIdentityPage(identityType) {
  browser.url(`/settings/identities/${identityType}`);
  browser.waitForVisible('.identity-page');
}

describe('edit identity schema', () => {
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
      goToIdentityPage('identitytest1');
      addTypedProperty('Age', 'number');
      saveChanges();
      tweekApiClient.eventuallyExpectKey('@tweek/schema/identitytest1', result =>
        expect(result).to.have.property('Age').that.deep.include({ type: 'number' }),
      );
    });

    it('add and update custom property', () => {
      goToIdentityPage('identitytest1');
      addTypedProperty('OsType', 'custom');
      saveChanges();
      tweekApiClient.eventuallyExpectKey('@tweek/schema/identitytest1', result => {
        expect(result).to.have
          .property('OsType')
          .that.deep.include({ type: { base: 'string', allowedValues: [] } });
      });
      updateExistingCustomProperty('OsType', { allowedValues: ['Android', 'iOS'] });
      saveChanges();
      tweekApiClient.eventuallyExpectKey('@tweek/schema/identitytest1', result => {
        expect(result).to.have
          .property('OsType')
          .that.deep.include({ type: { base: 'string', allowedValues: ['Android', 'iOS'] } });
      });
    });

    it('delete property and save', () => {
      goToIdentityPage('identitytest2');
      deleteProperty('Group');
      saveChanges();
      tweekApiClient.waitForKeyToEqual('@tweek/schema/identitytest2', {});
    });
  });
});

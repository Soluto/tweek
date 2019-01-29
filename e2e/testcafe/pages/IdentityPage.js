import { Selector, t } from 'testcafe';
import { dataComp, dataField } from '../utils/selector-utils';

export default class IdentityPage {
  details = Selector(dataComp('identity-details'));
  saveChangesButton = this.details.find(dataComp('save-changes'));

  searchArea = Selector(dataComp('search-identity'));
  identityTypeInput = this.searchArea.find(dataField('identity-type'));
  identityIdInput = this.searchArea.find(dataField('identity-id'));
  searchButton = this.searchArea.find(dataComp('search'));

  __fixedKey = Selector(dataComp('fixed-key'));
  __property = Selector(dataComp('identity-property'));

  newFixedKey = Selector(dataComp('new-fixed-key'));
  newFixedKeyInput = this.newFixedKey.find(dataField('key'));
  newFixedValueInput = this.newFixedKey.find(dataField('value'));
  addFixedKeyButton = this.newFixedKey.find(dataField('add'));

  identityDetails(type, id) {
    return this.details
      .withAttribute('data-identity-id', id)
      .withAttribute('data-identity-type', type);
  }

  newFixedValueInputWithType(type) {
    return this.newFixedValueInput.withAttribute('data-value-type', type.toLowerCase());
  }

  fixedKey(key) {
    return this.__fixedKey.withAttribute('data-fixed-key', key);
  }

  fixedKeyDeleteButton(key) {
    return this.fixedKey(key).find(dataComp('delete-fixed-key'));
  }

  fixedKeyValueInput(key, type) {
    const input = this.fixedKey(key).find(dataField('value'));
    if (type) {
      return input.withAttribute('data-value-type', type.toLowerCase());
    }
    return input;
  }

  async addFixedKey(key, value, valueType = typeof value) {
    const valueInput = this.newFixedValueInputWithType(valueType);
    value = value.toString();

    await t
      .expect(this.newFixedKeyInput.disabled)
      .notOk()
      .typeText(this.newFixedKeyInput, key, { replace: true })
      .expect(valueInput.disabled)
      .notOk()
      .typeText(valueInput, value, { replace: true });

    await t.click(this.addFixedKeyButton);

    await t.expect(this.fixedKey(key).visible).ok();
  }

  async updateFixedKey(key, value, valueType = typeof value) {
    const valueInput = this.fixedKeyValueInput(key, valueType);
    value = value.toString();

    await t
      .expect(valueInput.disabled)
      .notOk()
      .typeText(valueInput, value, { replace: true });
  }

  property(property) {
    return this.__property.withAttribute('data-property', property);
  }

  propertyValueInput(property) {
    return this.property(property).find(dataField('value'));
  }

  async updateProperty(property, value) {
    const valueInput = this.propertyValueInput(property);

    await t
      .expect(valueInput.disabled)
      .notOk()
      .typeText(valueInput, value.toString(), { replace: true });
  }

  async open(type, id) {
    await t
      .expect(this.searchArea.visible)
      .ok()
      .typeText(this.identityTypeInput, type, { replace: true })
      .typeText(this.identityIdInput, id, { replace: true })
      .click(this.searchButton)
      .expect(this.identityDetails(type, id).exists)
      .ok();
  }

  async commitChanges() {
    const buttonWithChanges = this.saveChangesButton.withAttribute(
      'data-state-has-changes',
      'true',
    );
    await t
      .expect(buttonWithChanges.exists)
      .ok('no changes to commit')
      .click(this.saveChangesButton)
      .expect(buttonWithChanges.withAttribute('data-state-is-saving', 'true').exists)
      .notOk('changes were not saved');
  }
}

import assert from 'assert';
import R from 'ramda';
import tweekApiClient from '../clients/tweek-api-client';
import { attributeSelector, dataComp, dataField } from './selector-utils';

const timeout = 5000;
const FIXED_KEY_PREFIX = '@fixed:';

const searchIdentity = selector => `${dataComp('search-identity')} ${selector}`;
const saveChangesButton = `${dataComp('identity-details')} ${dataComp('save-changes')}`;

const extractOverrideKeys = R.pipe(
  R.toPairs,
  R.filter(R.pipe(R.prop(0), R.startsWith(FIXED_KEY_PREFIX))),
  R.map(R.adjust(R.replace(FIXED_KEY_PREFIX, ''), 0)),
  R.fromPairs,
);

const extractProperties = R.pickBy(
  (_, prop) => !prop.startsWith(FIXED_KEY_PREFIX) && prop !== '@CreationDate',
);

export default class Identity {
  constructor(type, id) {
    this._type = type;
    this._id = id;
  }

  static open(type, id) {
    browser.waitForVisible(dataComp('search-identity'), timeout);

    $(searchIdentity(dataField('identity-type'))).setValue(type);
    $(searchIdentity(dataField('identity-id'))).setValue(id);
    $(searchIdentity(dataComp('search'))).click();

    return new Identity(type, id).waitToLoad();
  }

  waitToLoad() {
    const selector = [
      dataComp('identity-details'),
      attributeSelector('data-identity-id', this._id),
      attributeSelector('data-identity-type', this._type),
    ].join('');

    browser.waitForExist(selector, timeout);

    return this;
  }

  get hasChanges() {
    return browser.getAttribute(saveChangesButton, 'data-state-has-changes') === 'true';
  }

  get isSaving() {
    return browser.getAttribute(saveChangesButton, 'data-state-is-saving') === 'true';
  }

  get overrideKeys() {
    const response = tweekApiClient.getContext(this._type, this._id);
    return extractOverrideKeys(response);
  }

  get properties() {
    const response = tweekApiClient.getContext(this._type, this._id);
    return extractProperties(response);
  }

  commitChanges(selector = saveChangesButton) {
    assert.ok(this.hasChanges, 'no changes to commit');
    browser.click(selector);
    browser.waitUntil(() => !this.hasChanges && !this.isSaving, timeout, 'changes were not saved');
    return this;
  }

  addOverrideKey(key, value, valueType = typeof value) {
    const newFixedKeyComponent = dataComp('new-fixed-key');
    const newKey = field => `${newFixedKeyComponent} ${dataField(field)}`;
    const keyInput = newKey('key');
    const valueInput =
      newKey('value') + attributeSelector('data-value-type', valueType.toLowerCase());
    const addButton = newKey('add');

    browser.waitForEnabled(keyInput, timeout);

    $(keyInput).setValue(key);
    browser.waitForEnabled(valueInput, timeout);
    $(valueInput).setValue(value);

    $(addButton).click();

    browser.waitForVisible(this._fixedKey(key), timeout);

    return this;
  }

  deleteOverrideKey(key) {
    const deleteButton = `${this._fixedKey(key)} ${dataComp('delete-fixed-key')}`;
    $(deleteButton).click();

    return this;
  }

  updateOverrideKey(key, value) {
    const valueInput = `${this._fixedKey(key)} ${dataField('value')}`;

    browser.waitForEnabled(valueInput, timeout);
    $(valueInput).setValue(value);

    return this;
  }

  updateProperty(property, value) {
    const valueInput = `${this._property(property)} ${dataField('value')}`;

    browser.waitForEnabled(valueInput, timeout);
    $(valueInput).setValue(value.toString());

    return this;
  }

  _fixedKey(key) {
    return dataComp('fixed-key') + attributeSelector('data-fixed-key', key);
  }

  _property(property) {
    return dataComp('identity-property') + attributeSelector('data-property', property);
  }
}

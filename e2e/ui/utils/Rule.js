import assert from 'assert';
import { dataComp, attributeSelector, nthSelector } from './selector-utils';

export default class Rule {
  constructor(ruleNumber) {
    this._rule = nthSelector(ruleNumber, dataComp('rule'));
  }

  static select(ruleNumber) {
    return new Rule(ruleNumber);
  }

  static add() {
    browser.click(dataComp('add-rule'));

    const newRule = new Rule(1);
    assert(
      browser.hasFocus(newRule._newPropertyInput()),
      'should focus the added rule first condition property name',
    );
    return newRule;
  }

  _ruleSelector(selector) {
    return `${this._rule} ${selector}`;
  }

  _condition(property = '') {
    return this._ruleSelector(dataComp('condition') + attributeSelector('data-property', property));
  }

  _newPropertyInput() {
    const emptyCondition = this._condition();
    return `${emptyCondition} ${dataComp('property-name')}`;
  }

  withCondition(property, value, timeout = 5000) {
    const condition = this._condition(property);

    if (!browser.isExisting(condition)) {
      const addButton = this._ruleSelector(dataComp('add-condition'));
      browser.click(addButton);
      browser.setValue(this._newPropertyInput(), property);

      const suggestionSelector =
        dataComp('property-suggestion') + attributeSelector('data-value', property);
      browser.waitForVisible(suggestionSelector, timeout);
      browser.click(suggestionSelector);
    }

    const propertyValue = `${condition} ${dataComp('property-value')}`;
    browser.waitForEnabled(propertyValue, timeout);
    browser.setValue(propertyValue, value);

    return this;
  }

  removeCondition(property) {
    const condition = this._condition(property);
    browser.click(`${condition} ${dataComp('delete-condition')}`);

    return this;
  }

  setValue(value, valueType = typeof value, timeout = 100) {
    const input = this._ruleSelector(
      dataComp('rule-value') + attributeSelector('data-value-type', valueType.toLowerCase()),
    );
    browser.waitForEnabled(input, timeout);
    browser.setValue(input, value.toString());

    return this;
  }
}

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

  static count() {
    return browser.elements(dataComp('rule')).value.length;
  }

  _ruleSelector(selector) {
    return `${this._rule} ${selector}`;
  }

  _ruleCompSelector(comp) {
    return this._ruleSelector(dataComp(comp));
  }

  _condition(property = '') {
    return this._ruleSelector(dataComp('condition') + attributeSelector('data-property', property));
  }

  _newPropertyInput() {
    const emptyCondition = this._condition();
    return `${emptyCondition} ${dataComp('property-name')}`;
  }

  _sliderComp(comp, i) {
    return this._ruleSelector(
      `${dataComp('custom-slider')} ${nthSelector(i, dataComp('legend-item'))} ${dataComp(comp)}`,
    );
  }

  setCondition(property, value = '', timeout = 5000) {
    const condition = this._condition(property);

    if (!browser.isExisting(condition)) {
      const addButton = this._ruleCompSelector('add-condition');
      browser.click(addButton);
      browser.setValue(this._newPropertyInput(), property);
    }

    if (value !== '') {
      const propertyValue = `${condition} ${dataComp('property-value')}`;
      browser.waitForEnabled(propertyValue, timeout);
      browser.setValue(propertyValue, value);
    }

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

  multiVariant() {
    browser.click(this._ruleCompSelector('convert-to-multi-variant'));
    browser.waitForVisible(this._ruleCompSelector('multi-variant-value'));

    return this;
  }

  setIdentity(identityType) {
    browser.setValue(this._ruleCompSelector('identity-selection'), identityType);

    return this;
  }

  singleValue() {
    const type = browser.getAttribute(this._ruleCompSelector('multi-variant-value'), 'data-type');
    if (type === 'bernoulliTrial') {
      browser.setValue(this._ruleCompSelector('bernoulli-trial-input'), 100);
      browser.click(this._ruleCompSelector('set-to-true'));
    } else if (type === 'weighted') {
      const argsCount = browser.elements(`${dataComp('custom-slider')} ${dataComp('legend-item')}`)
        .value.length;
      for (let i = 1; i < argsCount; i++) {
        browser.click(this._sliderComp('delete-legend-button', 1));
      }
    } else {
      throw `unknown type ${type}`;
    }

    return this;
  }

  setValues(args) {
    args = Object.entries(args);
    const argsCount = browser.elements(`${dataComp('custom-slider')} ${dataComp('legend-item')}`)
      .value.length;

    for (let i = 0; i < args.length - argsCount; i++) {
      browser.click(this._ruleCompSelector('add-variant-button'));
    }

    args.forEach(([arg, percent], i) => {
      browser.setValue(this._sliderComp('legend-value', i + 1), arg);
      browser.setValue(this._sliderComp('legend-percent', i + 1), percent);
    });

    return this;
  }

  waitForVisible(timeout = 5000) {
    browser.waitForVisible(this._rule, timeout);

    return this;
  }
}

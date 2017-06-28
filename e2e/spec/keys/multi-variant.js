/* global describe, before, beforeEach, after, it, browser */

import KeysPageObject, { BLANK_KEY_NAME } from '../../utils/KeysPageObject';
import { expect } from 'chai';
import { diff } from 'deep-diff';
import selectors from '../../selectors/keySelectors';
import { _getSelectorByIndex, getRelativeSelector } from '../../selectors/selectorUtils';

const dataComp = x => `[data-comp= "${x}"]`;
const clickComp = x => browser.click(dataComp(x));

const sliderComp = (x, i) => getRelativeSelector([
  dataComp('custom-slider'),
  _getSelectorByIndex(dataComp('legend-item'), i),
  dataComp(x),
]);

describe('MultiVariant value type', () => {
  const keysPageObject = new KeysPageObject(browser);
  beforeEach(() => {
    keysPageObject.goToBase();
    keysPageObject.goToKey(BLANK_KEY_NAME);
  });

  it('should succeed editing boolean value type', () => {
    const expectedValue = {
      Matcher: {},
      Type: 'MultiVariant',
      OwnerType: 'other',
      ValueDistribution: {
        type: 'bernoulliTrial',
        args: 0.1,
      },
    };

    browser.setValue(selectors.KEY_VALUE_TYPE_INPUT, 'boolean');
    browser.click(selectors.ADD_RULE_BUTTON);
    keysPageObject.removeRuleCondition(1, 1);
    clickComp('convert-to-multi-variant-button');

    let value = keysPageObject.getKeySource().rules[0];
    expect(value).to.have.property('Salt');

    const salt = value.Salt;
    expect(salt).to.not.equal('');
    delete value.Salt;

    let diffs = diff(expectedValue, value);
    expect(diffs).to.equal(undefined, 'rule is not as expected. diffs are:' + JSON.stringify(diffs));

    browser.setValue(dataComp('bernoulli-trial-input'), 100);
    clickComp('set-to-true-button');
    clickComp('convert-to-multi-variant-button');

    value = keysPageObject.getKeySource().rules[0];
    expect(value.Salt).to.equal(salt);
  });

  it('should succeed editing other value types', () => {
    const args = {
      val1: 20,
      val2: 35,
      val3: 45,
    };
    const expectedValue = {
      Matcher: {},
      Type: 'MultiVariant',
      OwnerType: 'other',
      ValueDistribution: {
        type: 'weighted',
        args,
      },
    };

    browser.setValue(selectors.KEY_VALUE_TYPE_INPUT, 'string');
    browser.click(selectors.ADD_RULE_BUTTON);
    keysPageObject.removeRuleCondition(1, 1);
    clickComp('convert-to-multi-variant-button');

    Object.keys(args).forEach((key, i) => {
      if (i > 1) clickComp('add-variant-button');
      browser.setValue(sliderComp('legend-value-input', i + 1), key);
      browser.setValue(sliderComp('legend-percent-input', i + 1), args[key]);
    });

    let value = keysPageObject.getKeySource().rules[0];
    expect(value).to.have.property('Salt');

    const salt = value.Salt;
    expect(salt).to.not.equal('');

    delete value.Salt;
    let diffs = diff(expectedValue, value);
    expect(diffs).to.equal(undefined, 'rule is not as expected. diffs are:' + JSON.stringify(diffs));

    browser.click(sliderComp('delete-legend-button', 1));
    browser.click(sliderComp('delete-legend-button', 1));
    clickComp('convert-to-multi-variant-button');

    value = keysPageObject.getKeySource().rules[0];
    expect(value.Salt).to.equal(salt);
  });
});

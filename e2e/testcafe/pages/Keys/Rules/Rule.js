import { Selector, t } from 'testcafe';
import { dataComp } from '../../../utils/selector-utils';
import Condition from './Condition';

class Slider {
  constructor(rule) {
    this.container = rule.container.find(dataComp('custom-slider'));
    this.legend = this.container.find(dataComp('legend-item'));
    this.valueInput = this.container.find(dataComp('legend-value'));
    this.percentInput = this.container.find(dataComp('legend-percent'));
    this.deleteLegendButton = this.container.find(dataComp('delete-legend-button'));
  }
}

class MultiVariantValue {
  constructor(rule) {
    this.value = rule.container.find(dataComp('multi-variant-value'));
    this.identity = rule.container.find(dataComp('identity-selection'));
    this.addVariantButton = rule.container.find(dataComp('add-variant-button'));

    this.bernoulliTrialInput = rule.container.find(dataComp('bernoulli-trial-input'));
    this.setToTrueButton = rule.container.find(dataComp('set-to-true'));

    this.slider = new Slider(rule);
  }

  async setValues(args) {
    const argsCount = await this.slider.legend.count;

    for (let i = 0; i < args.length; i++) {
      if (i >= argsCount) {
        await t.click(this.addVariantButton);
      }

      const { value, weight } = args[i];

      await t
        .typeText(this.slider.valueInput.nth(i), value, { replace: true })
        .typeText(this.slider.percentInput.nth(i), weight, { replace: true });
    }
  }

  async toSingleValue() {
    const type = await this.value.getAttribute('data-type');

    if (type === 'bernoulliTrial') {
      await t
        .typeText(this.bernoulliTrialInput, 100, { replace: true })
        .click(this.setToTrueButton);
    } else if (type === 'weighted') {
      const argsCount = await this.slider.legend.count;

      for (let i = 1; i < argsCount; i++) {
        await t.click(this.slider.deleteLegendButton);
      }
    } else {
      throw `unknown type ${type}`;
    }
  }
}

export default class Rule {
  static ruleContainer = Selector(dataComp('rule'));

  constructor(ruleNumber = 0) {
    this.container = Rule.ruleContainer.nth(ruleNumber);
    this.newCondition = new Condition(this);
    this.value = this.container.find(dataComp('rule-value'));
    this.addConditionButton = this.container.find(dataComp('add-condition'));
    this.multiVariantButton = this.container.find(dataComp('convert-to-multi-variant'));
  }

  async condition(property = '') {
    const condition = new Condition(this, property);

    if (!(await condition.container.exists)) {
      if (!(await this.newCondition.visible)) {
        await t.click(this.addConditionButton);
      }

      await t
        .typeText(this.newCondition.propertyInput, property, { paste: true, replace: true })
        .click(this.value);
    }

    return condition;
  }

  async setValue(value, valueType = typeof value) {
    const input = this.value.withAttribute('data-value-type', valueType.toLowerCase());

    await t
      .expect(input.disabled)
      .notOk()
      .typeText(input, value.toString());
  }

  async toMultiVariant() {
    await t.click(this.multiVariantButton);

    const multiVariantValue = new MultiVariantValue(this);

    await t.expect(multiVariantValue.value.visible).ok();

    return multiVariantValue;
  }
}

import { t } from 'testcafe';
import { attributeSelector, dataComp } from '../../../utils/selector-utils';
import TypedInput from '../TypedInput';

export default class Condition {
  constructor(rule, property = '') {
    this.container = rule.container.find(
      `${dataComp('condition')}${attributeSelector('data-property', property)}`,
    );
    this.propertyInput = this.container.find(dataComp('property-name'));
    this.value = new TypedInput(this.container.find(dataComp('property-value')));
    this.validationIcon = this.container.find(dataComp('validation-icon'));
    this.deleteButton = this.container.find(dataComp('delete-condition'));
  }

  async setValue(value) {
    await t.expect(this.value.input.disabled).notOk();

    if (!Array.isArray(value)) {
      await t.typeText(this.value.input, value, { replace: true });
    } else {
      await this.value.tagInput.addMany(value);
    }
  }
}

import { t } from 'testcafe';
import { dataComp } from '../../../utils/selector-utils';
import Input from '../Input';

export default class Condition {
  constructor(rule, property = '') {
    this.container = rule.container
      .find(dataComp('condition'))
      .withAttribute('data-property', property);
    this.propertyNameInput = this.container.find(dataComp('property-name'));
    this.propertyValueInput = this.container.find(dataComp('property-value'));
    this.validationIcon = this.container.find(dataComp('validation-icon'));
    this.deleteButton = this.container.find(dataComp('delete-condition'));
  }

  async setValue(value) {
    await t.expect(this.propertyValueInput.disabled).notOk();

    if (!Array.isArray(value)) {
      await t.typeText(this.propertyValueInput, value, { replace: true });
    } else {
      await new Input(this.propertyValueInput).addMany(items);
    }
  }
}

import { Selector, t } from 'testcafe';
import { dataComp, dataField } from '../../utils/selector-utils';

export default class FixedKey {
  constructor(key, type = 'string') {
    this.container = Selector(dataComp('fixed-key')).withAttribute('data-fixed-key', key);
    this.deleteButton = this.container.find(dataComp('delete-fixed-key'));

    this.valueInput = this.container.find(dataField('value'));
    if (type) {
      this.valueInput = this.valueInput.withAttribute('data-value-type', type.toLowerCase());
    }
  }

  async update(value) {
    value = value.toString();

    await t
      .expect(this.valueInput.disabled)
      .notOk()
      .typeText(this.valueInput, value, { replace: true });
  }
}

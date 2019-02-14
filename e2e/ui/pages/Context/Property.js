import { Selector, t } from 'testcafe';
import { dataComp, dataField } from '../../utils/selector-utils';

export default class Property {
  constructor(property) {
    this.container = Selector(dataComp('identity-property')).withAttribute(
      'data-property',
      property,
    );
    this.valueInput = this.container.find(dataField('value'));
  }

  async update(value) {
    await t
      .expect(this.valueInput.disabled)
      .notOk()
      .typeText(this.valueInput, value.toString(), { replace: true });
  }
}

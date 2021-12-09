import { Selector, t } from 'testcafe';
import { dataComp, dataField } from '../../utils/selector-utils';

export default class Property {
  constructor(name) {
    this.container = Selector(dataComp('property-item')).withAttribute('data-property-name', name);
    this.typeContainer = this.container.find(dataField('property-type'));

    this.baseType = this.typeContainer.find(dataField('base'));
    this.allowedValuesInput = this.typeContainer.find(dataField('allowed-values')).find('input');
    this.deleteButton = this.container.find(dataComp('remove'));
  }

  async selectType(type) {
    await t
      .click(this.baseType.find(dataComp('type-select')))
      .click(this.baseType.find(dataLabel(type)).find('button'));
  }

  async addAllowedValues(allowedValues) {
    for (const allowedValue of allowedValues) {
      await t.typeText(this.allowedValuesInput, allowedValue).pressKey('enter');
    }
  }
}

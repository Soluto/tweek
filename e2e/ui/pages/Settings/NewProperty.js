import { Selector, t } from 'testcafe';
import { attributeSelector, dataComp, dataField } from '../../utils/selector-utils';
import Property from './Property';

const dataLabel = attributeSelector('data-label');

export default class NewProperty {
  container = Selector(dataComp('new-property-item'));
  nameInput = this.container.find(dataField('property-name'));
  typeSelect = this.container.find(dataComp('type-select'));
  advancedButton = this.container.find(dataComp('advanced'));
  addButton = this.container.find(dataComp('add'));

  async add(name, type, advanced) {
    const property = new Property(name);
    await t.typeText(this.nameInput, name);

    if (type === 'string' && !advanced) {
      await t.pressKey('enter');
    } else {
      type = type || 'string';

      await t.click(this.typeSelect).click(this.container.find(dataLabel(type)).find('button'));

      if (advanced) {
        await t.click(this.advancedButton);
      }

      await t.click(this.addButton);
    }

    await t.expect(property.container.visible).ok();
    return property;
  }
}

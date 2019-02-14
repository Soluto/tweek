import { Selector, t } from 'testcafe';
import { dataComp, dataField } from '../../utils/selector-utils';
import FixedKey from './FixedKey';

export default class NewFixedKey {
  container = Selector(dataComp('new-fixed-key'));
  keyInput = this.container.find(dataField('key'));
  valueInput = this.container.find(dataField('value'));
  addButton = this.container.find(dataField('add'));

  async add(key, value, valueType = typeof value) {
    const valueInput = this.valueInput.withAttribute('data-value-type', valueType.toLowerCase());
    value = value.toString();

    await t
      .expect(this.keyInput.disabled)
      .notOk()
      .typeText(this.keyInput, key, { replace: true })
      .expect(valueInput.disabled)
      .notOk()
      .typeText(valueInput, value, { replace: true });

    await t.click(this.addButton);

    const fixedKey = new FixedKey(key, valueType);

    await t.expect(fixedKey.container.visible).ok();

    return fixedKey;
  }
}

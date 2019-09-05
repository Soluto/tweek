import { Selector, t } from 'testcafe';
import { dataComp } from '../../../utils/selector-utils';
import Condition from './Condition';
import Rule from './Rule';

export default class NewRule {
  addButton = Selector(dataComp('add-rule'));

  async add() {
    await t.click(this.addButton);
    const rule = new Rule();

    await t
      .expect(new Condition(rule).propertyInput.focused)
      .ok('should focus the added rule first condition property name');

    return rule;
  }
}

import { Selector, t } from 'testcafe';
import { dataComp, dataField } from '../../utils/selector-utils';
import EditKey from './EditKey';

export default class NewKey {
  container = Selector(dataComp('add-key-page'));
  name = this.container.find(dataComp('new-key-name'));
  nameInput = this.name.find(dataField('new-key-name-input'));
  nameSuggestions = this.name.find(dataField('suggestions'));
  nameValidation = this.name.find(dataComp('validation-icon'));
  formatSelector = this.container.find(dataComp('key-format-selector'));
  valueTypeSelector = this.container.find(dataComp('key-value-type-selector'));
  continueButton = this.container.find(dataComp('add-key-button'));

  async continue() {
    await t.click(this.continueButton);

    const editKey = new EditKey();

    await t.expect(editKey.container.visible).ok();

    return editKey;
  }
}

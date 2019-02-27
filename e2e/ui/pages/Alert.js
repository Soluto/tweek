import { Selector, t } from 'testcafe';
import { attributeSelector } from '../utils/selector-utils';

export default class Alert {
  section = Selector('#alerts');
  background = Selector('.rodal-mask');
  dialog = Selector('.rodal-dialog');

  button(name) {
    return this.section.find(attributeSelector('data-alert-button', name));
  }

  okButton = this.button('ok');
  cancelButton = this.button('cancel');
  saveButton = this.button('save');

  async acceptIfRaised() {
    const isVisible = await this.okButton.visible;
    if (isVisible) {
      await t.click(this.okButton);
    }
  }
}

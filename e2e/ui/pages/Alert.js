import { Selector, t } from 'testcafe';
import { attributeSelector } from '../utils/selector-utils';

export default class Alert {
  background = Selector('.rodal-mask');
  dialog = Selector('.rodal-dialog');

  constructor(container) {
    this.section = container || Selector('#alerts');
    this.okButton = this.button('ok');
    this.cancelButton = this.button('cancel');
    this.saveButton = this.button('save');
  }

  button(name) {
    return this.section.find(attributeSelector('data-alert-button', name));
  }

  async acceptIfRaised() {
    const isVisible = await this.okButton.visible;
    if (isVisible) {
      await t.click(this.okButton);
    }
  }
}

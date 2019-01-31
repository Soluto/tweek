import { Selector, t } from 'testcafe';
import { attributeSelector, dataComp } from '../../utils/selector-utils';
import Identity from './Identity';

export default class SettingsPage {
  sideMenu = Selector('.side-menu');

  newIdentity = this.sideMenu.find(dataComp('add-new-identity'));
  newIdentityInput = this.newIdentity.find('input');
  newIdentityButton = this.newIdentity.find('button');

  find(identityType) {
    return this.sideMenu.find(attributeSelector('data-identity-type', identityType));
  }

  async add(identityType) {
    await t
      .expect(this.newIdentity.visible)
      .ok()
      .click(this.newIdentityButton)
      .typeText(this.newIdentityInput, identityType)
      .pressKey('enter');

    const currentIdentity = new Identity(identityType);

    await t.expect(currentIdentity.container.visible).ok();

    return currentIdentity;
  }

  async open(identityType) {
    const button = this.find(identityType);
    const currentIdentity = new Identity(identityType);

    await t
      .expect(button.visible)
      .ok()
      .click(button)
      .expect(currentIdentity.container.visible)
      .ok();

    return currentIdentity;
  }
}

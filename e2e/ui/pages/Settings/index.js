import { Selector, t } from 'testcafe';
import { attributeSelector, dataComp } from '../../utils/selector-utils';
import Identity from './Identity';
import PoliciesSection from './Policies';
import { editorUrl } from '../../utils/constants';
import { getLocation } from '../../utils/location-utils';

export default class SettingsPage {
  sideMenu = Selector(dataComp('settings-side-bar'));

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

  async openPoliciesPage() {
    const button = this.sideMenu.find('a').withExactText('Policies');
    const policies = new PoliciesSection();
    await t
      .expect(button.visible)
      .ok()
      .click(button)
      .expect(policies.container.visible)
      .ok()
      .expect(getLocation())
      .eql(`${editorUrl}/settings/policies`);

    return policies;
  }
}

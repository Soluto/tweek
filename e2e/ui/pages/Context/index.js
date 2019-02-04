import { Selector, t } from 'testcafe';
import { dataComp, dataField } from '../../utils/selector-utils';
import Identity from './Identity';

export default class ContextPage {
  searchArea = Selector(dataComp('search-identity'));
  identityTypeInput = this.searchArea.find(dataField('identity-type'));
  identityIdInput = this.searchArea.find(dataField('identity-id'));
  searchButton = this.searchArea.find(dataComp('search'));

  async open(type, id) {
    const identity = new Identity(type, id);

    await t
      .expect(this.searchArea.visible)
      .ok()
      .typeText(this.identityTypeInput, type, { replace: true })
      .typeText(this.identityIdInput, id, { replace: true })
      .click(this.searchButton)
      .expect(identity.details.exists)
      .ok();

    return identity;
  }
}

import { Selector, t } from 'testcafe';
import { dataComp } from '../../utils/selector-utils';
import FixedKey from './FixedKey';
import NewFixedKey from './NewFixedKey';
import Property from './Property';

export default class Identity {
  newFixedKey = new NewFixedKey();

  constructor(type, id) {
    this.details = Selector(dataComp('identity-details'))
      .withAttribute('data-identity-id', id)
      .withAttribute('data-identity-type', type);

    this.saveChangesButton = this.details.find(dataComp('save-changes'));
  }

  fixedKey(key, type) {
    return new FixedKey(key, type);
  }

  property(name) {
    return new Property(name);
  }

  async commitChanges() {
    await t
      .expect(this.saveChangesButton.withAttribute('data-state-has-changes', 'true').exists)
      .ok('no changes to commit')
      .click(this.saveChangesButton)
      .expect(
        this.saveChangesButton
          .withAttribute('data-state-has-changes', 'false')
          .withAttribute('data-state-is-saving', 'false').exists,
      )
      .ok('changes were not saved');
  }
}

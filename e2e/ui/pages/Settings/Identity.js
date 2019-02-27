import { Selector, t } from 'testcafe';
import { dataComp } from '../../utils/selector-utils';
import NewProperty from './NewProperty';
import Property from './Property';

export default class Identity {
  newProperty = new NewProperty();

  constructor(identityType) {
    this.container = Selector('.identity-page').withAttribute(
      'data-identity-type',
      identityType.toLowerCase(),
    );

    this.saveButton = this.container.find(dataComp('save-button'));
    this.deleteButton = this.container.find(dataComp('delete-identity'));
  }

  property(name) {
    return new Property(name);
  }
}

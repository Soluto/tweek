import { t } from 'testcafe';
import { dataComp } from '../../../utils/selector-utils';
import Alert from '../../Alert';
import ObjectEditor from '../ObjectEditor';

export default class ObjectInput {
  constructor(container) {
    this.editObjectButton = container.find(dataComp('object-editor'));
    this.alert = new Alert(container);
  }

  async editObject() {
    await t.click(this.editObjectButton);

    return new ObjectEditor();
  }
}

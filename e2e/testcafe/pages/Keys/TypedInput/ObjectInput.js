import { t } from 'testcafe';
import { dataComp } from '../../../utils/selector-utils';
import ObjectEditor from '../ObjectEditor';
import Alert from '../../Alert';

export default class ObjectInput {
  constructor(container) {
    this.editObjectButton = container.find(dataComp('object-editor'));
    this.alert = new Alert();
  }

  async editObject() {
    await t.click(this.editObjectButton);

    return new ObjectEditor();
  }
}

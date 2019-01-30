import { Selector, t } from 'testcafe';
import { dataComp } from '../../utils/selector-utils';
import ObjectEditor from './ObjectEditor';

export default class ConstValue {
  container = Selector(dataComp('const-editor'));
  input = this.container.find('input');
  editObjectButton = Selector(dataComp('object-editor'));

  async editObject() {
    await t.click(this.editObjectButton);

    return new ObjectEditor();
  }
}

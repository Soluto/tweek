import { Selector } from 'testcafe';
import { dataComp } from '../../utils/selector-utils';
import ObjectInput from './TypedInput/ObjectInput';

export default class ConstValue {
  container = Selector(dataComp('const-editor'));
  input = this.container.find('input');
  objectInput = new ObjectInput(this.container);
}

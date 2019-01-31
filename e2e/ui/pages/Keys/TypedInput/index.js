import TagInput from './TagInput';
import ObjectInput from './ObjectInput';

export default class TypedInput {
  constructor(container) {
    this.input = container;
    this.tagInput = new TagInput(container);
    this.objectInput = new ObjectInput(container);
  }
}

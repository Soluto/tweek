import { t } from 'testcafe';

export default class TagInput {
  constructor(selector) {
    this.input = selector.find('.tag-input input');
  }

  async add(item) {
    await t
      .expect(this.input.visible)
      .ok()
      .typeText(this.input, item.toString())
      .pressKey('enter');
  }

  async addMany(items) {
    for (const item of items) {
      await this.add(item);
    }
  }
}

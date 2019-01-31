import { t } from 'testcafe';

export default class TagInput {
  constructor(selector) {
    this.container = selector.find('.tags-container');
    this.input = this.container.find('.tag-input input');
    this.deleteButton = this.container.find('.tag-delete-button');
  }

  async add(item, paste) {
    await t
      .expect(this.input.visible)
      .ok()
      .typeText(this.input, item.toString(), { paste });

    if (!paste) {
      await t.pressKey('enter');
    }
  }

  async addMany(items) {
    for (const item of items) {
      await this.add(item);
    }
  }
}

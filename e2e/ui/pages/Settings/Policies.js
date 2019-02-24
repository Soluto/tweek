import { Selector, t, ClientFunction } from 'testcafe';

const read = ClientFunction(() => window.monaco.editor.getModels()[0].getValue());
const update = ClientFunction(() => window.monaco.editor.getModels()[0].setValue(text));

export class PolicyEditor {
  constructor(container) {
    this.container = container;
    this.editor = this.container.find('.monaco-editor');
    this.saveButton = this.container.find('button.save-button');
  }

  async read() {
    return await read();
  }

  async update(text) {
    return await update.with({
      dependencies: { text },
    })();
  }

  hasChanges() {
    return this.saveButton.withAttribute('data-state-has-changes', 'true').exists;
  }

  isValid() {
    return this.saveButton.withAttribute('data-state-is-valid', 'true').exists;
  }

  async save() {
    return await t
      .expect(this.hasChanges())
      .ok()
      .click(this.saveButton);
  }
}

export default class PoliciesSection {
  container = Selector('.policies-page');
  tab = 'ACL';

  async currentTab() {
    const panel = this.container.find(`[role=tabpanel]`);
    await t.expect(panel.visible).ok();
    return new PolicyEditor(panel);
  }

  async changeTab(name) {
    const tabButton = this.container.find('[role=tab]').withText(name);
    const id = await tabButton.getAttribute('id');
    const panel = this.container.find(`[role=tabpanel][aria-labelledby=${id}]`);

    //container
    await t
      .click(this.container.find('[role=tab]').withText(name))
      .expect(panel.visible)
      .ok();

    return new PolicyEditor(panel);
  }
}

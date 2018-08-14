const timeout = 15000;
const tagsInput = input => `${input} .tag-input input`;

class Input {
  addItem(input, item) {
    const tagInput = tagsInput(input);
    browser.waitForVisible(tagInput, timeout);
    browser.setValue(tagInput, `${item}\n`);
    return this;
  }
}

export default new Input();

import { ClientFunction, Selector, t } from 'testcafe';

const timeoutOptions = { timeoutSeconds: 10 };

const getSource = ClientFunction(() => {
  const value = window.monaco.editor.getModels()[0].getValue();
  return JSON.parse(value);
});

const setSource = ClientFunction(() => {
  window.monaco.editor.getModels()[0].setValue(source);
});

export default class ObjectEditor {
  monaco = Selector('.monaco-editor');

  async getSource() {
    await t.expect(this.monaco.visible).ok(timeoutOptions);
    return await getSource();
  }

  async setSource(source) {
    await t.expect(this.monaco.visible).ok(timeoutOptions);
    return await setSource.with({ dependencies: { source } })();
  }
}

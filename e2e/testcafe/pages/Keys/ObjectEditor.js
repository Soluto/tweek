import { ClientFunction, Selector } from 'testcafe';

export default class ObjectEditor {
  monaco = Selector('.monaco-editor');

  getSource = ClientFunction(() => {
    const value = window.monaco.editor.getModels()[0].getValue();
    return JSON.parse(value);
  });

  // pass source in dependencies
  setSource = ClientFunction(() => {
    window.monaco.editor.getModels()[0].setValue(source);
  });
}

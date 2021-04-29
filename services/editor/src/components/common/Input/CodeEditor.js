import MonacoEditor from '@monaco-editor/react';
import React from 'react';
import { connect } from 'react-redux';
import { AutoSizer } from 'react-virtualized';
import { isStringValidJson } from '../../../services/types-service';
import { buttons, showCustomAlert } from '../../../store/ducks/alerts';
import Input from './Input';

const monacoOptions = {
  autoIndent: true,
  automaticLayout: true,
  formatOnPaste: true,
  formatOnType: true,
  scrollBeyondLastLine: false,
  minimap: {
    enabled: false,
  },
};

const getEmptyValue = (valueType) => {
  let baseType = valueType.base || valueType.name;
  if (baseType === 'array') {
    return `[\n\t\n]`;
  }
  if (baseType === 'object') {
    return `{\n\t\n}`;
  }
  return '';
};

export const withJsonEditor = connect(null, { showCustomAlert });

const CodeEditor = ({
  showCustomAlert,
  onChange,
  value,
  valueType,
  'data-comp': dataComp,
  ...props
}) => {
  const editJson = async (currentSource, valueType) => {
    const saveButton = {
      text: 'Save',
      value: true,
      className: 'rodal-save-btn',
      'data-alert-button': 'save',
      validate: (data) => isStringValidJson(data, valueType),
    };

    const editModal = {
      title: 'Edit Object',
      component: ({ onChange, componentData: data }) => (
        <AutoSizer disableWidth>
          {({ height }) => (
            <div style={{ height: height - 75 }}>
              <MonacoEditor
                key={`m_${height}`}
                language="json"
                value={
                  data ||
                  (currentSource
                    ? JSON.stringify(currentSource, null, 4)
                    : getEmptyValue(valueType))
                }
                options={{ ...monacoOptions, readOnly: false }}
                onChange={(newSource) => onChange(newSource)}
                onMount={(editor) => {
                  setTimeout(() => {
                    if (editor.viewModel) {
                      const lineCount = editor.viewModel.lines.getViewLineCount();
                      const editLineNum = lineCount > 1 ? lineCount - 1 : lineCount;
                      editor.setPosition({
                        lineNumber: editLineNum,
                        column: editor.getModel().getLineMaxColumn(editLineNum),
                      });
                      editor.revealLine(lineCount);
                    }
                    editor.focus();
                  }, 500);
                }}
              />
            </div>
          )}
        </AutoSizer>
      ),
      resizable: true,
      buttons: [saveButton, buttons.CANCEL],
    };

    const editModalResult = await showCustomAlert(editModal);
    if (editModalResult.result) {
      onChange(editModalResult.data);
    }
  };

  return (
    <div data-comp={dataComp}>
      <Input
        onDoubleClick={() => editJson(value, valueType)}
        readOnly
        {...props}
        onChange={onChange}
        value={value ? JSON.stringify(value) : value}
      />
      <button
        className="text-input object-type-expander"
        data-comp="object-editor"
        onClick={() => editJson(value, valueType)}
      />
    </div>
  );
};

export default withJsonEditor(CodeEditor);

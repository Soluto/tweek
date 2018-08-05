import React from 'react';
import { compose, mapProps } from 'recompose';
import { showCustomAlert, buttons } from '../../../store/ducks/alerts';
import { connect } from 'react-redux';
import MonacoEditor from 'react-monaco-editor';
import { AutoSizer } from 'react-virtualized';
import { isStringValidJson } from '../../../services/types-service';

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

export const withJsonEditor = compose(
  connect(null, {
    showCustomAlert,
  }),
  mapProps(({ onChange, showCustomAlert, ...props }) => {
    const editJson = async (currentSource) => {
      const saveButton = {
        text: 'Save',
        value: true,
        className: 'rodal-save-btn',
        'data-alert-button': 'save',
        validate: data => isStringValidJson(data),
      };

      const editModal = {
        title: 'Edit Object',
        component: ({ onChange, componentData: data }) => (
          <AutoSizer disableWidth>
            {({ height }) => (
              <div style={{ height: height - 65 }}>
                <MonacoEditor
                  language="json"
                  value={
                    data || (currentSource ? JSON.stringify(currentSource, null, 4) : `{\n\t\n}`)
                  }
                  options={{ ...monacoOptions, readOnly: false }}
                  onChange={newSource => onChange(newSource)}
                  editorDidMount={(editor) => {
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
        buttons: [saveButton, buttons.CANCEL],
      };

      const editModalResult = await showCustomAlert(editModal);
      if (editModalResult.result) {
        onChange(editModalResult.data);
      }
    };

    return { editJson, onChange, ...props };
  }),
);

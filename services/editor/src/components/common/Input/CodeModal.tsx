import MonacoEditor from '@monaco-editor/react';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { AutoSizer } from 'react-virtualized';
// @ts-ignore
import Rodal from 'rodal';
import { ValueType } from 'tweek-client';
import { isStringValidJson } from '../../../services/types-service';

const monacoOptions = {
  autoIndent: 'full' as const,
  automaticLayout: true,
  formatOnPaste: true,
  formatOnType: true,
  scrollBeyondLastLine: false,
  minimap: {
    enabled: false,
  },
  readOnly: false,
};

export type CodeModalProps = {
  visible: boolean;
  value: string;
  valueType: ValueType;
  onClose: (value?: string) => void;
};

const CodeModal = ({ visible, value: initialValue, valueType, onClose }: CodeModalProps) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [visible, initialValue]);

  return (
    <Rodal
      closeOnEsc
      visible={visible}
      showCloseButton={false}
      onClose={onClose}
      className={classNames('rodal-container', 'resizable')}
    >
      <h1 className="rodal-header">Edit Object</h1>

      {visible && (
        <AutoSizer disableWidth>
          {({ height }) => (
            <div style={{ height: height - 75 }}>
              <MonacoEditor
                key={`m_${height}`}
                language="json"
                value={value}
                options={monacoOptions}
                onChange={(value) => setValue(value!)}
                onMount={(editor) => {
                  setTimeout(() => {
                    const model = editor.getModel();
                    if (model) {
                      const lineCount = model.getLineCount();
                      const editLineNum = lineCount > 1 ? lineCount - 1 : lineCount;
                      editor.setPosition({
                        lineNumber: editLineNum,
                        column: model.getLineMaxColumn(editLineNum),
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
      )}

      <div className="rodal-button-container">
        <button
          disabled={value === initialValue || !isStringValidJson(value, valueType)}
          onClick={() => onClose(value)}
          className="rodal-save-btn"
          data-alert-button="save"
        >
          Save
        </button>
        <button onClick={() => onClose()} className="rodal-cancel-btn" data-alert-button="cancel">
          Cancel
        </button>
      </div>
    </Rodal>
  );
};

export default CodeModal;

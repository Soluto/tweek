import classNames from 'classnames';
import React, { useState } from 'react';
import './EditableText.css';

export type EditableTextProps = {
  value: string;
  placeHolder?: string;
  maxLength?: number;
  onTextChanged?: (text: string) => void;
  isReadonly?: boolean;
  classNames?: {
    container?: string;
    form?: string;
    input?: string;
    text?: string;
  };
  'data-comp'?: string;
};

const EditableText = ({
  value,
  placeHolder,
  maxLength,
  classNames: classes = {},
  onTextChanged = () => {},
  isReadonly,
  'data-comp': dataComp = 'editable-text',
}: EditableTextProps) => {
  const [isInEditMode, setIsInEditMode] = useState(false);
  return (
    <div className={classNames('editable-text-container', classes.container)} data-comp={dataComp}>
      {isInEditMode ? (
        <form
          data-field="form"
          onSubmit={(e) => {
            setIsInEditMode(false);
            e.preventDefault();
          }}
          className={classNames('editable-text-form', classes.form)}
        >
          <input
            data-field="input"
            type="text"
            ref={(input) => input && input.focus()}
            className={classNames('editable-text-input', classes.input)}
            onChange={(e) => onTextChanged(e.target.value)}
            value={value}
            placeholder={placeHolder}
            onBlur={() => setIsInEditMode(false)}
            maxLength={maxLength}
          />
        </form>
      ) : (
        <div
          data-field="text"
          className={classNames('editable-text-value', classes.text)}
          onClick={() => isReadonly || setIsInEditMode(true)}
        >
          {value}
        </div>
      )}
    </div>
  );
};

export default EditableText;

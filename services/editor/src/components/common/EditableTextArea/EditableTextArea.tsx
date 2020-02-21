import React, { useState } from 'react';
import classNames from 'classnames';
import TextareaAutosize from 'react-autosize-textarea';
import './EditableTextArea.css';

export type EditableTextAreaProps = {
  value: string;
  placeHolder?: string;
  title?: string;
  maxLength?: number;
  classNames?: {
    container?: string;
    input?: string;
  };
  onTextChanged?: (text: string) => void;
};

const EditableTextArea = ({
  value,
  placeHolder,
  title,
  maxLength,
  classNames: classes = {},
  onTextChanged = () => {},
}: EditableTextAreaProps) => {
  const [isInEditMode, setIsInEditMode] = useState(false);
  return (
    <div className={classNames('textarea-container', classes.container)}>
      <TextareaAutosize
        readOnly={!isInEditMode}
        onClick={() => setIsInEditMode(true)}
        onChange={(e) => onTextChanged((e.target as any).value)}
        value={value}
        placeholder={placeHolder}
        title={title}
        className={classNames('textarea-input', classes.input, {
          'read-only': !isInEditMode,
        })}
        onBlur={() => {
          value = value.trim();
          setIsInEditMode(false);
          onTextChanged(value);
        }}
        maxLength={maxLength}
      />
    </div>
  );
};

export default EditableTextArea;

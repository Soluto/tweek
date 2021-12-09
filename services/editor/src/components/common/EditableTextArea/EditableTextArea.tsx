import classNames from 'classnames';
import React, { ChangeEvent, useState } from 'react';
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
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onTextChanged(e.target.value)}
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

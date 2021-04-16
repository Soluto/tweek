import classNames from 'classnames';
import React, { useState } from 'react';
import TextareaAutosize from 'react-autosize-textarea';
import './EditableTextArea.css';

const EditableTextArea = ({
  value,
  placeHolder,
  title,
  maxLength,
  classNames: classes = {},
  onTextChanged = () => {},
}) => {
  const [isInEditMode, setIsInEditMode] = useState(false);

  return (
    <div className={classNames('textarea-container', classes.container)}>
      <TextareaAutosize
        readOnly={!isInEditMode}
        onClick={() => setIsInEditMode(true)}
        onChange={(e) => onTextChanged(e.target.value)}
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

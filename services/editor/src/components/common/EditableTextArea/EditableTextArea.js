import React from 'react';
import classNames from 'classnames';
import { compose, withState } from 'recompose';
import TextareaAutosize from 'react-autosize-textarea';
import './EditableTextArea.css';

const EditableTextArea = compose(withState('isInEditMode', 'setIsInEditMode', false))(
  ({
    value,
    placeHolder,
    title,
    maxLength,
    classNames: classes = {},
    isInEditMode,
    setIsInEditMode,
    onTextChanged = () => {},
  }) => (
    <div className={classNames('textarea-container', classes.container)}>
      <TextareaAutosize
        readOnly={!isInEditMode}
        onClick={() => setIsInEditMode(true)}
        onChange={e => onTextChanged(e.target.value)}
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
  ),
);

export default EditableTextArea;

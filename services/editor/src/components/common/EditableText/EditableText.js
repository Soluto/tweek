import classNames from 'classnames';
import React, { useState } from 'react';
import wrapComponentWithClass from '../../../hoc/wrap-component-with-class';
import './EditableText.css';

const EditableText = ({
  value,
  placeHolder,
  maxLength,
  classNames: classes = {},
  onTextChanged = () => {},
  isReadonly,
  ...props
}) => {
  const [isInEditMode, setIsInEditMode] = useState(false);

  return (
    <div
      className={classNames('editable-text-container', classes.container)}
      data-comp="editable-text"
      {...props}
    >
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

export default wrapComponentWithClass(EditableText);

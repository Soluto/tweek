import React from 'react';
import ReactDOM from 'react-dom';
import { Component } from 'react';
import { connect } from 'react-redux';
import style from './EditableTextArea.css';
import classNames from 'classnames';
import { compose, withState } from 'recompose';
import TextareaAutosize from 'react-autosize-textarea';

const EditableTextArea = compose(
  withState('isInEditMode', 'setIsInEditMode', false),
)(
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
    <div className={classNames(style['textarea-container'], classes.container)}>
      <TextareaAutosize
        ref={(input) => {
          if (!input) return;
          input.refs.textarea.readOnly = !isInEditMode;
          if (isInEditMode) input.refs.textarea.focus();
        }}
        onClick={() => setIsInEditMode(true)}
        onChange={e => onTextChanged(e.target.value)}
        value={value}
        placeholder={placeHolder}
        title={title}
        className={classNames(style['textarea-input'], classes.input, {
          [style['read-only']]: !isInEditMode,
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

import React from 'react';
import Json from 'react-json';
import TypedInput from './common/Input/TypedInput';
import './ConstEditor.css';

const ConstEditor = ({ value, valueType, onChange }) =>
  <div data-comp="const-editor">
    {valueType === 'object'
      ? <Json value={value} onChange={onChange} />
      : <TypedInput {...{ value, valueType, onChange }} />}
  </div>;

export default ConstEditor;

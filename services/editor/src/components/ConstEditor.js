import React from 'react';
import TypedInput from './common/Input/TypedInput';
import { JsonEditor } from './JsonEditor';

const ConstEditor = ({ value, valueType, onChange, onValidationChange }) =>
  <div data-comp="const-editor">
    {valueType === 'object'
      ? <JsonEditor {...{ value, onChange, onValidationChange }} />
      : <TypedInput {...{ value, valueType, onChange }} />}
  </div>;

export default ConstEditor;
